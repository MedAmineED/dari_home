'use client';

import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/format';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';
import { clsx } from '@/lib/clsx';
import { Icon } from '@/components/ui/Icon';

/**
 * Progress towards free delivery.
 *
 * Unexpected shipping cost is the most cited reason shoppers abandon a cart,
 * so the threshold is stated here rather than sprung on the customer at the
 * payment step. Showing what is left to qualify also lifts average order
 * value, because a visible gap reads as a goal worth closing.
 */
export function FreeShippingBar({
  subtotal,
  dict,
}: {
  subtotal: number;
  dict: Dictionary;
}) {
  if (FREE_SHIPPING_THRESHOLD <= 0) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const unlocked = remaining === 0;
  const percent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  return (
    <div className="mb-4">
      <p
        className={clsx(
          'flex items-center gap-2 text-xs',
          unlocked ? 'font-semibold text-primary' : 'text-on-surface-variant',
        )}
      >
        <Icon
          name={unlocked ? 'check' : 'local_shipping'}
          className="!text-[16px] shrink-0"
        />
        <span>
          {unlocked
            ? dict.cart.freeShipUnlocked
            : dict.cart.freeShipRemaining.replace(
                '{amount}',
                formatPrice(remaining, dict.common.currency),
              )}
        </span>
      </p>
      {/* The fill is a block child, so it grows from the inline start and
          therefore fills right-to-left in Arabic without extra rules. */}
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-variant"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
