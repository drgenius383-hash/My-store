import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-600">The page you are looking for does not exist or was removed.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to shop
      </Link>
    </div>
  );
}
