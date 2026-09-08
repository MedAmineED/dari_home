'use client';

import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { navItems } from '@/config/nav';
import { Fragment } from 'react';

const labelBySegment: Record<string, string> = Object.fromEntries(
  navItems.map((item) => [item.href.replace(/^\//, ''), item.label]),
);

/** Simple breadcrumb trail derived from the current path (RTL-aware). */
export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm">
      {segments.map((segment, index) => {
        const label = labelBySegment[segment] ?? segment;
        const isLast = index === segments.length - 1;
        return (
          <Fragment key={`${segment}-${index}`}>
            {index > 0 && (
              <ChevronLeft className="h-4 w-4 text-on-surface-variant/50" />
            )}
            <span
              className={
                isLast
                  ? 'font-medium text-on-surface'
                  : 'text-on-surface-variant'
              }
            >
              {label}
            </span>
          </Fragment>
        );
      })}
    </nav>
  );
}
