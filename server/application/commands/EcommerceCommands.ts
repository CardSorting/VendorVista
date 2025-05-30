// Ecommerce Commands following CQRS pattern and Apple's design philosophy
export interface AddToCartCommand {
  userId: number;
  productId: number;
  quantity: number;
}

export interface UpdateCartItemCommand {
  userId: number;
  productId: number;
  quantity: number;
}

export interface RemoveFromCartCommand {
  userId: number;
  productId: number;
}

export interface ClearCartCommand {
  userId: number;
}

export interface CreateOrderCommand {
  userId: number;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface ProcessPaymentCommand {
  orderId: number;
  paymentMethodId?: string;
  returnUrl?: string;
}

export interface ConfirmOrderCommand {
  orderId: number;
  paymentIntentId: string;
}

export interface UpdateOrderStatusCommand {
  orderId: number;
  status: string;
  trackingNumber?: string;
}

export interface CancelOrderCommand {
  orderId: number;
  reason?: string;
}

export interface RefundOrderCommand {
  orderId: number;
  amount?: number;
  reason?: string;
}

export interface ShipOrderCommand {
  orderId: number;
  trackingNumber: string;
  carrier?: string;
}

export interface CreateProductCommand {
  artworkId: number;
  productTypeId: number;
  price: number;
  artistMargin?: number;
  isActive?: boolean;
}

export interface UpdateProductCommand {
  productId: number;
  price?: number;
  artistMargin?: number;
  isActive?: boolean;
}

export interface CreateProductTypeCommand {
  name: string;
  basePrice: number;
  description?: string;
}