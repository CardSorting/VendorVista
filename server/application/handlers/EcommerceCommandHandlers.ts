// Ecommerce Command Handlers following CQRS and SOLID principles
import { ICommandHandler } from '../common/ICommandHandler.js';
import { Money } from '../../domain/common/ValueObjects.js';
import { ShoppingCart, CartItem } from '../../domain/aggregates/ShoppingCartAggregate.js';
import { Order, OrderItem, ShippingAddress, OrderStatus } from '../../domain/aggregates/OrderAggregate.js';
import { IPaymentService } from '../../domain/services/PaymentService.js';
import { storage } from '../../storage.js';
import {
  AddToCartCommand,
  UpdateCartItemCommand,
  RemoveFromCartCommand,
  ClearCartCommand,
  CreateOrderCommand,
  ProcessPaymentCommand,
  ConfirmOrderCommand,
  UpdateOrderStatusCommand,
  CancelOrderCommand,
  RefundOrderCommand,
  ShipOrderCommand
} from '../commands/EcommerceCommands.js';

export class AddToCartCommandHandler implements ICommandHandler<AddToCartCommand, void> {
  async handle(command: AddToCartCommand): Promise<void> {
    // Get product details
    const product = await storage.getProduct(command.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Get artwork details for the product
    const artwork = await storage.getArtwork(product.artworkId);
    if (!artwork) {
      throw new Error('Artwork not found');
    }

    // Get artist details
    const artist = await storage.getArtist(artwork.artistId);
    if (!artist) {
      throw new Error('Artist not found');
    }

    // Get product type details
    const productTypes = await storage.getProductTypes();
    const productType = productTypes.find(pt => pt.id === product.productTypeId);
    if (!productType) {
      throw new Error('Product type not found');
    }

    // Add item to cart via storage layer
    await storage.addCartItem({
      userId: command.userId,
      productId: command.productId,
      quantity: command.quantity
    });
  }
}

export class UpdateCartItemCommandHandler implements ICommandHandler<UpdateCartItemCommand, void> {
  async handle(command: UpdateCartItemCommand): Promise<void> {
    // Get existing cart items for user
    const cartItems = await storage.getCartItems(command.userId);
    const existingItem = cartItems.find(item => item.productId === command.productId);
    
    if (!existingItem) {
      throw new Error('Cart item not found');
    }

    if (command.quantity <= 0) {
      await storage.removeCartItem(existingItem.id);
    } else {
      await storage.updateCartItem(existingItem.id, command.quantity);
    }
  }
}

export class RemoveFromCartCommandHandler implements ICommandHandler<RemoveFromCartCommand, void> {
  async handle(command: RemoveFromCartCommand): Promise<void> {
    const cartItems = await storage.getCartItems(command.userId);
    const existingItem = cartItems.find(item => item.productId === command.productId);
    
    if (!existingItem) {
      throw new Error('Cart item not found');
    }

    await storage.removeCartItem(existingItem.id);
  }
}

export class ClearCartCommandHandler implements ICommandHandler<ClearCartCommand, void> {
  async handle(command: ClearCartCommand): Promise<void> {
    await storage.clearCart(command.userId);
  }
}

export class CreateOrderCommandHandler implements ICommandHandler<CreateOrderCommand, Order> {
  async handle(command: CreateOrderCommand): Promise<Order> {
    // Get user's cart items
    const cartItems = await storage.getCartItems(command.userId);
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Create order items with detailed product information
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const product = await storage.getProduct(cartItem.productId);
      if (!product) {
        throw new Error(`Product ${cartItem.productId} not found`);
      }

      const artwork = await storage.getArtwork(product.artworkId);
      if (!artwork) {
        throw new Error(`Artwork for product ${cartItem.productId} not found`);
      }

      const artist = await storage.getArtist(artwork.artistId);
      if (!artist) {
        throw new Error(`Artist for artwork ${artwork.id} not found`);
      }

      const productPrice = parseFloat(product.price);
      const itemTotal = productPrice * (cartItem.quantity || 1);
      totalAmount += itemTotal;

      const orderItem = new OrderItem(
        cartItem.productId,
        cartItem.quantity || 1,
        new Money(productPrice),
        `${artwork.title} - Print`, // Product name would be dynamic based on product type
        artwork.title,
        artist.displayName
      );

      orderItems.push(orderItem);
    }

    // Create shipping address
    const shippingAddress = new ShippingAddress(
      command.shippingAddress.fullName,
      command.shippingAddress.addressLine1,
      command.shippingAddress.addressLine2 || null,
      command.shippingAddress.city,
      command.shippingAddress.state,
      command.shippingAddress.postalCode,
      command.shippingAddress.country
    );

    // Create order through storage layer
    const orderData = await storage.createOrder({
      userId: command.userId,
      totalAmount: totalAmount.toFixed(2),
      status: OrderStatus.PENDING,
      shippingAddress: shippingAddress.toString()
    });

    // Add order items
    for (const orderItem of orderItems) {
      await storage.addOrderItem({
        orderId: orderData.id,
        productId: orderItem.productId,
        quantity: orderItem.quantity,
        price: orderItem.unitPrice.toString()
      });
    }

    // Clear the cart
    await storage.clearCart(command.userId);

    // Return the created order
    const order = Order.fromPersistence(
      orderData.id,
      orderData.userId,
      orderItems,
      orderData.status || OrderStatus.PENDING,
      shippingAddress,
      orderData.trackingNumber,
      null, // paymentIntentId
      orderData.createdAt || new Date()
    );

    return order;
  }
}

export class ProcessPaymentCommandHandler implements ICommandHandler<ProcessPaymentCommand, { clientSecret: string; paymentIntentId: string }> {
  constructor(private paymentService: IPaymentService) {}

  async handle(command: ProcessPaymentCommand): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const order = await storage.getOrder(command.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Order is not in pending status');
    }

    const amount = new Money(parseFloat(order.totalAmount));
    const paymentIntent = await this.paymentService.createPaymentIntent(
      amount,
      command.orderId
    );

    return {
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id
    };
  }
}

export class ConfirmOrderCommandHandler implements ICommandHandler<ConfirmOrderCommand, void> {
  constructor(private paymentService: IPaymentService) {}

  async handle(command: ConfirmOrderCommand): Promise<void> {
    const order = await storage.getOrder(command.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Verify payment with payment service
    const paymentIntent = await this.paymentService.getPaymentIntent(command.paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment has not been completed');
    }

    // Update order status
    await storage.updateOrderStatus(command.orderId, OrderStatus.CONFIRMED);

    // Update artist sales totals
    const orderItems = await storage.getOrderItems(command.orderId);
    for (const item of orderItems) {
      const product = await storage.getProduct(item.productId);
      if (product) {
        const artwork = await storage.getArtwork(product.artworkId);
        if (artwork) {
          const artist = await storage.getArtist(artwork.artistId);
          if (artist) {
            const saleAmount = parseFloat(item.price) * item.quantity;
            const currentSales = artist.totalSales || 0;
            await storage.updateArtist(artist.id, {
              totalSales: currentSales + saleAmount
            });
          }
        }
      }
    }
  }
}

export class UpdateOrderStatusCommandHandler implements ICommandHandler<UpdateOrderStatusCommand, void> {
  async handle(command: UpdateOrderStatusCommand): Promise<void> {
    const order = await storage.getOrder(command.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const updates: any = { status: command.status };
    if (command.trackingNumber) {
      updates.trackingNumber = command.trackingNumber;
    }

    await storage.updateOrderStatus(command.orderId, command.status);
  }
}

export class ShipOrderCommandHandler implements ICommandHandler<ShipOrderCommand, void> {
  async handle(command: ShipOrderCommand): Promise<void> {
    const order = await storage.getOrder(command.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.CONFIRMED && order.status !== 'processing') {
      throw new Error('Order must be confirmed or processing to ship');
    }

    await storage.updateOrderStatus(command.orderId, OrderStatus.SHIPPED);
    
    // Update with tracking number if provided
    if (command.trackingNumber) {
      const updatedOrder = await storage.getOrder(command.orderId);
      if (updatedOrder) {
        // Update tracking number through a separate method if needed
      }
    }
  }
}

export class CancelOrderCommandHandler implements ICommandHandler<CancelOrderCommand, void> {
  constructor(private paymentService: IPaymentService) {}

  async handle(command: CancelOrderCommand): Promise<void> {
    const order = await storage.getOrder(command.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status as OrderStatus)) {
      throw new Error('Cannot cancel shipped, delivered, or already cancelled orders');
    }

    // If order was paid, process refund
    if (order.status === OrderStatus.CONFIRMED || order.status === 'processing') {
      // Process refund if payment was made
      // This would require storing the payment intent ID with the order
    }

    await storage.updateOrderStatus(command.orderId, OrderStatus.CANCELLED);
  }
}

export class RefundOrderCommandHandler implements ICommandHandler<RefundOrderCommand, void> {
  constructor(private paymentService: IPaymentService) {}

  async handle(command: RefundOrderCommand): Promise<void> {
    const order = await storage.getOrder(command.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new Error('Only delivered orders can be refunded');
    }

    // Process refund through payment service
    // This would require storing the payment intent ID with the order

    await storage.updateOrderStatus(command.orderId, OrderStatus.REFUNDED);
  }
}