export default function Footer() {
  return (
    <footer style={{ textAlign: 'center', padding: '20px', marginTop: '50px', borderTop: '1px solid #eee' }}>
      <p>© {new Date().getFullYear()} My Store. All rights reserved.</p>
    </footer>
  );
}
