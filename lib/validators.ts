export type ProductInput = {
  name: string;
  price: number;
  quantity: number;
  category: string | null;
  image_url?: string | null;
};

function toInt(value: unknown): number {
  if (value === null || value === undefined) return NaN;
  if (typeof value === 'string' && value.trim() === '') return NaN;
  return Number(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseProduct(body: any): { value: ProductInput } | { error: string } {
  const name = String(body?.name ?? '').trim();
  const price = toInt(body?.price);
  const quantity = toInt(body?.quantity);
  const category = String(body?.category ?? '').trim();

  if (!name) return { error: 'Product name is required.' };
  if (name.length > 160) return { error: 'Product name is too long.' };
  if (!Number.isInteger(price) || price < 0) {
    return { error: 'Price must be a whole number (0 or more).' };
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { error: 'Quantity must be a whole number (0 or more).' };
  }

  const value: ProductInput = {
    name,
    price,
    quantity,
    category: category || null,
  };
  if (typeof body?.image_url === 'string' && body.image_url) {
    value.image_url = body.image_url;
  }
  return { value };
}
