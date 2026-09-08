'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { strings } from '@/config/strings';
import { getApiErrorMessage } from '@/lib/api/client';
import type { Category } from '@/lib/api/catalog-types';
import {
  useCreateCategory,
  useUpdateCategory,
} from '@/hooks/use-categories';

const schema = z.object({
  nameAr: z.string().min(1, strings.common.required),
  nameFr: z.string().min(1, strings.common.required),
  parentId: z.string(),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
  descriptionAr: z.string().optional(),
  descriptionFr: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  category: Category | null;
  parentOptions: Category[];
}

export function CategoryFormModal({
  open,
  onClose,
  category,
  parentOptions,
}: Props) {
  const c = strings.catalog.categories;
  const isEdit = Boolean(category);
  const create = useCreateCategory();
  const update = useUpdateCategory();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      nameAr: category?.nameAr ?? '',
      nameFr: category?.nameFr ?? '',
      parentId: category?.parentId ?? '',
      sortOrder: category?.sortOrder ?? 0,
      isActive: category?.isActive ?? true,
      descriptionAr: category?.descriptionAr ?? '',
      descriptionFr: category?.descriptionFr ?? '',
    },
  });

  const isActive = watch('isActive');

  const onSubmit = async (values: FormValues) => {
    const payload = {
      nameAr: values.nameAr,
      nameFr: values.nameFr,
      parentId: values.parentId || null,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
      descriptionAr: values.descriptionAr || undefined,
      descriptionFr: values.descriptionFr || undefined,
    };
    try {
      if (category) {
        await update.mutateAsync({ id: category.id, input: payload });
      } else {
        await create.mutateAsync(payload);
      }
      toast.success(strings.common.saved);
      reset();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  // Exclude self from parent options to avoid the obvious cycle.
  const options = parentOptions.filter((o) => o.id !== category?.id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? c.edit : c.add}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nameAr">{c.nameAr}</Label>
            <Input id="nameAr" hasError={!!errors.nameAr} {...register('nameAr')} />
            {errors.nameAr && (
              <p className="mt-1 text-xs text-error">{errors.nameAr.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="nameFr">{c.nameFr}</Label>
            <Input id="nameFr" dir="ltr" hasError={!!errors.nameFr} {...register('nameFr')} />
            {errors.nameFr && (
              <p className="mt-1 text-xs text-error">{errors.nameFr.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="parentId">{c.parent}</Label>
            <Select id="parentId" {...register('parentId')}>
              <option value="">{c.noParent}</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nameAr} — {o.nameFr}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="sortOrder">{c.sortOrder}</Label>
            <Input
              id="sortOrder"
              type="number"
              dir="ltr"
              {...register('sortOrder')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="descriptionAr">{c.descAr}</Label>
            <Textarea id="descriptionAr" rows={2} {...register('descriptionAr')} />
          </div>
          <div>
            <Label htmlFor="descriptionFr">{c.descFr}</Label>
            <Textarea id="descriptionFr" dir="ltr" rows={2} {...register('descriptionFr')} />
          </div>
        </div>

        <Toggle
          checked={isActive}
          onChange={(v) => setValue('isActive', v)}
          label={strings.common.active}
        />

        <div className="flex justify-start gap-3 pt-2">
          <Button
            type="submit"
            isLoading={create.isPending || update.isPending}
          >
            {strings.common.save}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            {strings.common.cancel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
