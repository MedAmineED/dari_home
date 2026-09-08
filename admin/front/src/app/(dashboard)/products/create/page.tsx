'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ProductForm } from '@/components/products/product-form';
import { strings } from '@/config/strings';
import { useCategories } from '@/hooks/use-categories';

export default function CreateProductPage() {
  const router = useRouter();
  const { data, isLoading } = useCategories({ limit: 100 });

  return (
    <div>
      <PageHeader
        title={strings.catalog.products.create}
        action={
          <Button variant="secondary" onClick={() => router.push('/products')}>
            <ArrowRight className="h-4 w-4" />
            {strings.common.back}
          </Button>
        }
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <ProductForm
          categories={data?.items ?? []}
          onSaved={(product) => router.push(`/products/${product.id}/edit`)}
        />
      )}
    </div>
  );
}
