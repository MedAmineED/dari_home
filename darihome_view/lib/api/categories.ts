import 'server-only';
import { resolveMediaUrl } from '../media';
import { apiGet } from './client';
import type { StorefrontCategory } from './types';

export async function getCategories(): Promise<StorefrontCategory[]> {
  const data = await apiGet<StorefrontCategory[]>('/storefront/categories', {
    revalidate: 3600,
  });
  return data.map((category) => ({
    ...category,
    image: resolveMediaUrl(category.image),
  }));
}
