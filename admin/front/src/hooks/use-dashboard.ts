import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, type DashboardPeriod } from '@/lib/api/dashboard';

export function useDashboardStats(period: DashboardPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'stats', period],
    queryFn: () => getDashboardStats(period),
  });
}
