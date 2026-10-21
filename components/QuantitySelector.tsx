'use client';

export default function QuantitySelector({
  value,
  onChange,
  max,
  min = 1,
  small = false,
}: {
  value: number;
  onChange: (next: number) => void;
  max: number;
  min?: number;
  small?: boolean;
}) {
  const size = small ? 'h-8 w-8 text-base' : 'h-10 w-10 text-lg';
  const btn = `${size} flex items-center justify-center rounded-full border border-gray-300 bg-white font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40`;

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={`min-w-[2ch] text-center font-semibold ${small ? 'text-sm' : 'text-base'}`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
