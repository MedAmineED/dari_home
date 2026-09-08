'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImageOff, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/common/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StatusBadge } from '@/components/products/status-badge';
import { strings } from '@/config/strings';
import { assetUrl, formatPrice } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api/client';
import type { Product, ProductStatus } from '@/lib/api/catalog-types';
import { useProducts, useDeleteProduct } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useAuth } from '@/providers/auth-provider';

const STATUSES: ProductStatus[] = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'];

export default function ProductsPage() {
  const p = strings.catalog.products;
  const router = useRouter();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('product:create');
  const canWrite = hasPermission('product:update');
  const canDelete = hasPermission('product:delete');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const { data, isLoading } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    categoryId: categoryId || undefined,
  });
  const { data: cats } = useCategories({ limit: 100 });
  const remove = useDeleteProduct();

  const resetPage = () => setPage(1);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove.mutateAsync(toDelete.id);
      toast.success(strings.common.deleted);
      setToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const items = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title={p.title}
        action={
          canCreate && (
            <Button onClick={() => router.push('/products/create')}>
              <Plus className="h-4 w-4" />
              {p.add}
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          className="max-w-xs"
          placeholder={p.searchPlaceholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
        />
        <Select
          className="max-w-40"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ProductStatus | '');
            resetPage();
          }}
        >
          <option value="">{p.allStatuses}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {strings.catalog.status[s]}
            </option>
          ))}
        </Select>
        <Select
          className="max-w-48"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            resetPage();
          }}
        >
          <option value="">{p.allCategories}</option>
          {(cats?.items ?? []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nameAr}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Package} message={p.empty} />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant text-right text-xs uppercase tracking-wide text-on-surface-variant">
                <th className="px-4 py-3 font-semibold">{p.product}</th>
                <th className="px-4 py-3 font-semibold">{p.category}</th>
                <th className="px-4 py-3 font-semibold">{p.price}</th>
                <th className="px-4 py-3 font-semibold">{p.status}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((product) => {
                const primary =
                  product.images.find((i) => i.isPrimary) ?? product.images[0];
                return (
                  <tr
                    key={product.id}
                    className="border-b border-outline-variant/60 last:border-0 hover:bg-surface-container/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded border border-outline-variant bg-surface-container">
                          {primary ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={assetUrl(primary.url) ?? ''}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageOff className="h-4 w-4 text-on-surface-variant" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-on-surface">
                            {product.nameAr}
                          </p>
                          <p className="truncate text-xs text-on-surface-variant" dir="ltr">
                            {product.nameFr}
                            {product.isFeatured && ' ★'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {product.category ? product.category.nameAr : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" dir="ltr">
                        <span className="font-medium text-on-surface">
                          {formatPrice(product.price)}
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs text-on-surface-variant line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                        {product.discountPercentage && (
                          <Badge tone="danger">-{product.discountPercentage}%</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {canWrite && (
                          <Link
                            href={`/products/${product.id}/edit`}
                            className="rounded p-1.5 text-on-surface-variant hover:bg-surface-container"
                            aria-label={strings.common.edit}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setToDelete(product)}
                            className="rounded p-1.5 text-error hover:bg-error-container/40"
                            aria-label={strings.common.delete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {data && <Pagination meta={data.meta} onPageChange={setPage} />}
      </Card>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={strings.common.confirmDelete}
        message={p.deleteMessage}
        isLoading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
