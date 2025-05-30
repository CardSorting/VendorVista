import { ValueObject } from '../base/ValueObject';

export interface ProductIdProps {
  value: number;
}

export class ProductId extends ValueObject<ProductIdProps> {
  get value(): number {
    return this.props.value;
  }

  public static create(value: number): ProductId {
    if (!value || value <= 0) {
      throw new Error('ProductId must be a positive number');
    }
    return new ProductId({ value });
  }

  public toString(): string {
    return this.value.toString();
  }

  public equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}