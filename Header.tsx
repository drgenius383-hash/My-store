import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
      <Link href="/" style={{ fontWeight: 'bold', fontSize: '20px' }}>My Store</Link>
      <nav style={{ display: 'flex', gap: '15px' }}>
        <Link href="/">Home</Link>
        <Link href="/cart">Cart</Link>
      </nav>
    </header>
  );
}
