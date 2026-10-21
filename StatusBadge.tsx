import type { OrderStatus } from '@/lib/types';

const STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  disapproved: 'bg-red-100 text-red-800',
};

const LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  disapproved: 'Disapproved',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
