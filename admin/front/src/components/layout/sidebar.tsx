'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/config/nav';
import { strings } from '@/config/strings';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const visibleItems = navItems.filter((item) =>
    hasPermission(item.permission),
  );

  return (
    <aside className="flex h-full w-sidebar flex-col bg-sidebar text-sidebar-text">
      <div className="flex h-header items-center gap-3 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-active font-heading text-lg font-bold">
          د
        </div>
        <div className="leading-tight">
          <p className="font-heading text-base font-semibold">
            {strings.appName}
          </p>
          <p className="text-xs text-sidebar-muted">{strings.appSubtitle}</p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          if (item.soon) {
            return (
              <div
                key={item.key}
                className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-muted/70"
                title={strings.common.comingSoon}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span className="rounded bg-sidebar-hover/60 px-1.5 py-0.5 text-[10px] font-medium">
                  {strings.common.comingSoon}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-active text-white'
                  : 'text-sidebar-text hover:bg-sidebar-hover',
              )}
            >
              {active && (
                <span className="absolute inset-y-1.5 -right-3 w-1 rounded-full bg-white/90" />
              )}
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
