'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useCart } from '@/lib/cart';
import QuantitySelector from './QuantitySelector';

export default function ProductActions({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.quantity <= 0) {
    return <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600">This product is sold out.</p>;
  }

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
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="label">Quantity</span>
        <QuantitySelector value={qty} onChange={setQty} max={product.quantity} />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button onClick={handleAdd} className="btn-primary flex-1 py-3 text-base">
          {added ? 'Added to cart ✓' : 'Add to cart'}
        </button>
        {added && (
          <Link href="/cart" className="btn-outline flex-1 py-3 text-base">
            View cart
          </Link>
        )}
      </div>
    </div>
  );
}
