'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Breadcrumbs } from './breadcrumbs';
import { Button } from '@/components/ui/button';
import { strings } from '@/config/strings';
import { useAuth } from '@/providers/auth-provider';

export function Header() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : '';

  return (
    <header className="flex h-header items-center justify-between border-b border-outline-variant bg-surface-lowest px-6">
      <Breadcrumbs />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-primary-on">
            {initials}
          </div>
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-medium text-on-surface">
              {user ? `${user.firstName} ${user.lastName}` : ''}
            </p>
            <p className="text-xs text-on-surface-variant">
              {user?.roles.join('، ')}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{strings.common.logout}</span>
        </Button>
      </div>
    </header>
  );
}
