export default function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-sm text-gray-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
      {label}
    </div>
  );
}
