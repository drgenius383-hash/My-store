'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useCart } from '@/lib/cart';
import { formatMoney } from '@/lib/format';
import ProductImage from './ProductImage';
import QuantitySelector from './QuantitySelector';

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.quantity <= 0;

  function handleAdd() {
    add(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.quantity,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="card flex flex-col overflow-hidden">
      <Link href={`/product/${product.id}`} className="relative block">
        <ProductImage src={product.image_url} alt={product.name} className="aspect-square w-full" />
        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center text-xs font-semibold text-white">
            Sold out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-2.5 sm:p-3">
        <Link href={`/product/${product.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-gray-800 hover:text-brand-600">
          {product.name}
        </Link>
        <p className="text-lg font-bold text-brand-600">{formatMoney(product.price)}</p>

        {!soldOut && (
          <div className="mt-auto flex flex-col gap-2">
            <QuantitySelector value={qty} onChange={setQty} max={product.quantity} small />
            <button onClick={handleAdd} className="btn-primary w-full">
              {added ? 'Added ✓' : 'Add to cart'}
            </button>
          </div>
        )}
        {soldOut && (
          <button disabled className="btn-outline mt-auto w-full">
            Sold out
          </button>
        )}
      </div>
    </article>
  );
}
