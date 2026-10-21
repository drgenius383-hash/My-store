export default function Footer() {
  return (
    <footer style={{ textAlign: 'center', padding: '20px', marginTop: '50px', borderTop: '1px solid #eee' }}>
      <p>© {new Date().getFullYear()} My Store. All rights reserved.</p>
    </footer>
  );
}

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
      <div className="container-x">
        © {new Date().getFullYear()} {STORE_NAME}. Pay by bank transfer. Delivery to the address on your account.
      </div>
    </footer>
  );
}
