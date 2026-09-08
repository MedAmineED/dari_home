'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { strings } from '@/config/strings';
import { getApiErrorMessage } from '@/lib/api/client';
import type {
  Category,
  Product,
  ProductInput,
  ProductStatus,
} from '@/lib/api/catalog-types';
import {
  useCreateProduct,
  useUpdateProduct,
} from '@/hooks/use-products';

const STATUSES: ProductStatus[] = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'];

const schema = z.object({
  nameAr: z.string().min(1, strings.common.required),
  nameFr: z.string().min(1, strings.common.required),
  shortDescriptionAr: z.string().optional(),
  shortDescriptionFr: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionFr: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().min(0, strings.common.required),
  oldPrice: z
    .union([z.coerce.number().min(0), z.literal('')])
    .optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']),
  isFeatured: z.boolean(),
  categoryId: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  product?: Product;
  categories: Category[];
  onSaved: (product: Product) => void;
}

export function ProductForm({ product, categories, onSaved }: Props) {
  const p = strings.catalog.products;
  const create = useCreateProduct();
  const update = useUpdateProduct();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      nameAr: product?.nameAr ?? '',
      nameFr: product?.nameFr ?? '',
      shortDescriptionAr: product?.shortDescriptionAr ?? '',
      shortDescriptionFr: product?.shortDescriptionFr ?? '',
      descriptionAr: product?.descriptionAr ?? '',
      descriptionFr: product?.descriptionFr ?? '',
      sku: product?.sku ?? '',
      price: product?.price ?? 0,
      oldPrice: product?.oldPrice ?? '',
      status: product?.status ?? 'DRAFT',
      isFeatured: product?.isFeatured ?? false,
      categoryId: product?.categoryId ?? '',
    },
  });

  const isFeatured = watch('isFeatured');

  const onSubmit = async (values: FormValues) => {
    const payload: ProductInput = {
      nameAr: values.nameAr,
      nameFr: values.nameFr,
      shortDescriptionAr: values.shortDescriptionAr || undefined,
      shortDescriptionFr: values.shortDescriptionFr || undefined,
      descriptionAr: values.descriptionAr || undefined,
      descriptionFr: values.descriptionFr || undefined,
      sku: values.sku || undefined,
      price: values.price,
      oldPrice: values.oldPrice === '' ? null : values.oldPrice,
      status: values.status,
      isFeatured: values.isFeatured,
      categoryId: values.categoryId || null,
    };
    try {
      const saved = product
        ? await update.mutateAsync({ id: product.id, input: payload })
        : await create.mutateAsync(payload);
      toast.success(strings.common.saved);
      onSaved(saved);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Arabic content (RTL) */}
        <Card>
          <CardHeader>
            <CardTitle>{p.arabicSection}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4" dir="rtl">
            <div>
              <Label htmlFor="nameAr">{p.name}</Label>
              <Input id="nameAr" hasError={!!errors.nameAr} {...register('nameAr')} />
              {errors.nameAr && (
                <p className="mt-1 text-xs text-error">{errors.nameAr.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="shortDescriptionAr">{p.shortDesc}</Label>
              <Textarea id="shortDescriptionAr" rows={2} {...register('shortDescriptionAr')} />
            </div>
            <div>
              <Label htmlFor="descriptionAr">{p.fullDesc}</Label>
              <Textarea id="descriptionAr" rows={4} {...register('descriptionAr')} />
            </div>
          </CardContent>
        </Card>

        {/* French content (LTR) */}
        <Card>
          <CardHeader>
            <CardTitle>{p.frenchSection}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4" dir="ltr">
            <div>
              <Label htmlFor="nameFr">{p.name}</Label>
              <Input id="nameFr" hasError={!!errors.nameFr} {...register('nameFr')} />
              {errors.nameFr && (
                <p className="mt-1 text-xs text-error">{errors.nameFr.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="shortDescriptionFr">{p.shortDesc}</Label>
              <Textarea id="shortDescriptionFr" rows={2} {...register('shortDescriptionFr')} />
            </div>
            <div>
              <Label htmlFor="descriptionFr">{p.fullDesc}</Label>
              <Textarea id="descriptionFr" rows={4} {...register('descriptionFr')} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{p.pricing}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">{p.price}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                dir="ltr"
                hasError={!!errors.price}
                {...register('price')}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-error">{errors.price.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="oldPrice">{p.oldPrice}</Label>
              <Input id="oldPrice" type="number" step="0.01" dir="ltr" {...register('oldPrice')} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="sku">{p.sku}</Label>
              <Input id="sku" dir="ltr" {...register('sku')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{p.organization}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="categoryId">{p.category}</Label>
              <Select id="categoryId" {...register('categoryId')}>
                <option value="">{p.noCategory}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameAr} — {cat.nameFr}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="status">{p.status}</Label>
              <Select id="status" {...register('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {strings.catalog.status[s]}
                  </option>
                ))}
              </Select>
            </div>
            <Toggle
              checked={isFeatured}
              onChange={(v) => setValue('isFeatured', v)}
              label={p.featured}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start gap-3">
        <Button type="submit" size="lg" isLoading={create.isPending || update.isPending}>
          {strings.common.save}
        </Button>
      </div>
    </form>
  );
}
