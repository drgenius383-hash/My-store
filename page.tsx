import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getPublicClient } from '@/lib/supabase/public';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const db = getPublicClient();
  const q = (searchParams.q ?? '').replace(/[%_,()]/g, ' ').trim();
  const category = (searchParams.category ?? '').trim();

  let query = db.from('products').select('*').order('created_at', { ascending: false }).limit(200);
  if (category) query = query.eq('category', category);
  if (q) query = query.ilike('name', `%${q}%`);

  const [productsRes, categoriesRes] = await Promise.all([
    query,
    db.from('products').select('category').not('category', 'is', null),
  ]);

  const products = (productsRes.data ?? []) as Product[];
  const categories = Array.from(
    new Set(((categoriesRes.data ?? []) as { category: string | null }[]).map((r) => r.category).filter(Boolean))
  ) as string[];

  return (
    <div className="container-x py-4">
      {categories.length > 0 && (
        <div className="-mx-3 mb-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
          <Link
            href="/"
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${
              !category ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-300 bg-white hover:bg-gray-100'
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/?category=${encodeURIComponent(c)}`}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${
                category === c ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-300 bg-white hover:bg-gray-100'
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {q && (
        <p className="mb-3 text-sm text-gray-600">
          Results for <strong>{q}</strong> ·{' '}
          <Link href="/" className="text-brand-600 underline">
            clear search
          </Link>
        </p>
      )}

      {products.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="font-semibold">No products found</p>
          <p className="mt-1 text-sm text-gray-500">
            {q || category ? 'Try a different search or category.' : 'Products will appear here once the store adds them.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
