/**
 * Free-shipping threshold, expressed in TND.
 *
 * This is a *business* number, not a technical one. Override it per
 * environment with NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD; set it to 0 to switch
 * the cart progress indicator off entirely.
 */
const configured = process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD;
const parsed =
  configured === undefined || configured.trim() === ''
    ? Number.NaN
    : Number(configured);

export const FREE_SHIPPING_THRESHOLD =
  Number.isFinite(parsed) && parsed >= 0 ? parsed : 300;
