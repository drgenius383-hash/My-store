export default function ProductImage({
  src,
  alt,
  className = '',
  eager = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-xs text-gray-400 ${className}`}>
        No image
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}
