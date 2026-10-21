'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { STORE_NAME } from '@/lib/config';

function SearchForm({ className = '' }: { className?: string }) {
  return (
    <form action="/" method="get" role="search" className={className}>
      <input
        type="search"
        name="q"
        placeholder="Search products"
        aria-label="Search products"
        className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      />
    </form>
  );
}

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();
  const { count } = useCart();
  const router = useRouter();

  const firstName = profile?.full_name?.split(' ')[0];

  async function handleSignOut() {
    await signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="container-x flex items-center gap-3 py-3">
        <Link href="/" className="shrink-0 text-lg font-extrabold tracking-tight text-brand-500 sm:text-xl">
          {STORE_NAME}
        </Link>

        <SearchForm className="hidden flex-1 md:block" />

        <nav className="ml-auto flex items-center gap-1 text-sm sm:gap-2">
          {!loading && user && (
            <>
              <Link href="/orders" className="rounded-full px-3 py-2 font-medium hover:bg-gray-100">
                My orders
              </Link>
              <span className="hidden max-w-[110px] truncate text-gray-500 lg:inline">
                {firstName ? `Hi, ${firstName}` : ''}
              </span>
              <button onClick={handleSignOut} className="rounded-full px-3 py-2 font-medium text-gray-600 hover:bg-gray-100">
                Log out
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 font-medium hover:bg-gray-100">
                Log in
              </Link>
              <Link href="/signup" className="hidden rounded-full bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700 sm:inline-block">
                Sign up
              </Link>
            </>
          )}
          <Link
            href="/cart"
            aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
            className="relative rounded-full p-2 hover:bg-gray-100"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>
        </nav>
      </div>
      <div className="container-x pb-3 md:hidden">
        <SearchForm />
      </div>
    </header>
  );
}
