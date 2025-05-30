import { Entity } from '../base/Entity';
import { ProductId } from '../value-objects/ProductId';
import { ArtworkId } from '../value-objects/ArtworkId';
import { Money } from '../value-objects/Money';
import { ProductVariant } from '../value-objects/ProductVariant';
import { ProductType } from '../value-objects/ProductType';

export interface ProductProps {
  artworkId: ArtworkId;
  productType: ProductType;
  basePrice: Money;
  variants: ProductVariant[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends Entity<ProductProps> {
  get artworkId(): ArtworkId {
    return this.props.artworkId;
  }

  get productType(): ProductType {
    return this.props.productType;
  }

  get basePrice(): Money {
    return this.props.basePrice;
  }

  get variants(): ProductVariant[] {
    return this.props.variants;
  }

  get isAvailable(): boolean {
    return this.props.isAvailable;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public calculatePriceForVariant(variantId: string): Money {
    const variant = this.variants.find(v => v.id === variantId);
    if (!variant) {
      throw new Error(`Variant ${variantId} not found`);
    }
    
    return this.basePrice.add(variant.priceModifier);
  }

  public addVariant(variant: ProductVariant): void {
    if (this.variants.some(v => v.id === variant.id)) {
      throw new Error(`Variant ${variant.id} already exists`);
    }
    
    this.props.variants.push(variant);
    this.props.updatedAt = new Date();
  }

  public removeVariant(variantId: string): void {
    const index = this.variants.findIndex(v => v.id === variantId);
    if (index === -1) {
      throw new Error(`Variant ${variantId} not found`);
    }
    
    this.props.variants.splice(index, 1);
    this.props.updatedAt = new Date();
  }

  public updateAvailability(isAvailable: boolean): void {
    this.props.isAvailable = isAvailable;
    this.props.updatedAt = new Date();
  }

  public static create(props: Omit<ProductProps, 'createdAt' | 'updatedAt'>, id?: ProductId): Product {
    const now = new Date();
    return new Product({
      ...props,
      createdAt: now,
      updatedAt: now
    }, id);
  }
}