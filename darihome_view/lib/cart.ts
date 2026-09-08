/** Shared cart types. The cart is client-side only (no cart backend yet). */

export interface CartItemInput {
  slug: string;
  nameAr: string;
  nameFr: string;
  price: number;
  image: string | null;
}

export interface CartItem extends CartItemInput {
  qty: number;
}

export const CART_STORAGE_KEY = 'darihome_cart';

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}
