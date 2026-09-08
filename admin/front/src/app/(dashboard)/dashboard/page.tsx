'use client';

import { ShieldCheck, KeyRound, UserCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { strings } from '@/config/strings';
import { useAuth } from '@/providers/auth-provider';

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-on-surface">
          {strings.dashboard.title}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          {strings.dashboard.welcome}
        </p>
      </div>

      <Card>
        <CardContent className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary-on">
            <UserCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-on-surface">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-on-surface-variant" dir="ltr">
              {user.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-tertiary" />
            <CardTitle>{strings.dashboard.yourRoles}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role}
                className="rounded bg-tertiary-container/15 px-2.5 py-1 text-xs font-semibold text-tertiary"
              >
                {role}
              </span>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary-container" />
            <CardTitle>
              {strings.dashboard.yourPermissions} ({user.permissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="scrollbar-thin max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-1.5" dir="ltr">
              {user.permissions.map((permission) => (
                <span
                  key={permission}
                  className="rounded bg-surface-container px-2 py-0.5 text-[11px] font-medium text-on-surface-variant"
                >
                  {permission}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {strings.dashboard.intro}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
