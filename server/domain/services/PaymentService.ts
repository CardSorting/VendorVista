// Payment Service - Following DDD and Apple's design philosophy
import { Money } from '../common/ValueObjects.js';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  clientSecret: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface RefundResult {
  id: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
  reason?: string;
}

export interface IPaymentService {
  createPaymentIntent(amount: Money, orderId: number, customerId?: string): Promise<PaymentIntent>;
  confirmPaymentIntent(paymentIntentId: string): Promise<PaymentIntent>;
  capturePaymentIntent(paymentIntentId: string): Promise<PaymentIntent>;
  refundPayment(paymentIntentId: string, amount?: Money, reason?: string): Promise<RefundResult>;
  getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent>;
  attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<void>;
}

export class PaymentService implements IPaymentService {
  private stripe: any;

  constructor(stripeSecretKey?: string) {
    if (stripeSecretKey) {
      // Initialize Stripe when key is provided
      this.initializeStripe(stripeSecretKey);
    }
  }

  private initializeStripe(secretKey: string) {
    try {
      // Dynamic import to avoid requiring Stripe if not configured
      const Stripe = require('stripe');
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    } catch (error) {
      console.warn('Stripe not available. Payment processing will be simulated.');
    }
  }

  async createPaymentIntent(amount: Money, orderId: number, customerId?: string): Promise<PaymentIntent> {
    if (!this.stripe) {
      // Simulation mode for development/testing
      return this.simulatePaymentIntent(amount, orderId);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount.amount * 100), // Convert to cents
        currency: amount.currency.toLowerCase(),
        metadata: {
          orderId: orderId.toString(),
        },
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    if (!this.stripe) {
      return this.simulatePaymentConfirmation(paymentIntentId);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  async capturePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    if (!this.stripe) {
      return this.simulatePaymentCapture(paymentIntentId);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.capture(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw new Error(`Payment capture failed: ${error.message}`);
    }
  }

  async refundPayment(paymentIntentId: string, amount?: Money, reason?: string): Promise<RefundResult> {
    if (!this.stripe) {
      return this.simulateRefund(paymentIntentId, amount);
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount.amount * 100) : undefined,
        reason: reason || 'requested_by_customer',
      });

      return {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        reason: refund.reason,
      };
    } catch (error) {
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    if (!this.stripe) {
      return this.simulateGetPaymentIntent(paymentIntentId);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<void> {
    if (!this.stripe) {
      return; // Simulate success
    }

    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      throw new Error(`Failed to attach payment method: ${error.message}`);
    }
  }

  // Simulation methods for development/testing
  private simulatePaymentIntent(amount: Money, orderId: number): PaymentIntent {
    const id = `pi_sim_${Date.now()}_${orderId}`;
    return {
      id,
      amount: amount.amount,
      currency: amount.currency,
      status: 'requires_payment_method',
      clientSecret: `${id}_secret_sim`,
    };
  }

  private simulatePaymentConfirmation(paymentIntentId: string): PaymentIntent {
    return {
      id: paymentIntentId,
      amount: 0, // Would need to be stored for real simulation
      currency: 'USD',
      status: 'succeeded',
      clientSecret: `${paymentIntentId}_secret_sim`,
    };
  }

  private simulatePaymentCapture(paymentIntentId: string): PaymentIntent {
    return {
      id: paymentIntentId,
      amount: 0,
      currency: 'USD',
      status: 'succeeded',
      clientSecret: `${paymentIntentId}_secret_sim`,
    };
  }

  private simulateRefund(paymentIntentId: string, amount?: Money): RefundResult {
    return {
      id: `re_sim_${Date.now()}`,
      amount: amount?.amount || 0,
      status: 'succeeded',
      reason: 'requested_by_customer',
    };
  }

  private simulateGetPaymentIntent(paymentIntentId: string): PaymentIntent {
    return {
      id: paymentIntentId,
      amount: 0,
      currency: 'USD',
      status: 'succeeded',
      clientSecret: `${paymentIntentId}_secret_sim`,
    };
  }
}