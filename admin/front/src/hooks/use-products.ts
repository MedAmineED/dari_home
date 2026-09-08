import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  getProduct,
  listProducts,
  setPrimaryImage,
  updateProduct,
  uploadProductImages,
} from '@/lib/api/products';
import type { ProductInput, ProductListParams } from '@/lib/api/catalog-types';

const KEY = 'products';

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => listProducts(params),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, 'detail', id],
    queryFn: () => getProduct(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      updateProduct(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, 'detail', id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useProductImages(productId: string) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: [KEY, 'detail', productId] });

  const upload = useMutation({
    mutationFn: (files: File[]) => uploadProductImages(productId, files),
    onSuccess: invalidate,
  });
  const setPrimary = useMutation({
    mutationFn: (imageId: string) => setPrimaryImage(productId, imageId),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (imageId: string) => deleteProductImage(productId, imageId),
    onSuccess: invalidate,
  });

  return { upload, setPrimary, remove };
}
