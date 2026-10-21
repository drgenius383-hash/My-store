import { STORE_NAME } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
      <div className="container-x">
        © {new Date().getFullYear()} {STORE_NAME}. Pay by bank transfer. Delivery to the address on your account.
      </div>
    </footer>
  );
}
