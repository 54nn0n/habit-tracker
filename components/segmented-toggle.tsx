interface ToggleOption<T extends string> {
  value: T;
  label: string;
  description: string;
}

interface SegmentedToggleProps<T extends string> {
  label: string;
  options: [ToggleOption<T>, ToggleOption<T>];
  value: T;
  color: string;
  onChange: (value: T) => void;
}

export default function SegmentedToggle<T extends string>({
  label,
  options,
  value,
  color,
  onChange,
}: SegmentedToggleProps<T>) {
  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-xs text-muted uppercase tracking-[2px]">
        {label}
      </p>
      <div
        className="flex"
        style={{ border: `1px solid var(--color-border)` }}
      >
        {options.map((opt, i) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="flex-1 py-2.5 transition-colors"
              style={{
                backgroundColor: isActive ? color : "transparent",
                borderLeft: i > 0 ? `1px solid var(--color-border)` : undefined,
              }}
            >
              <span
                className="font-display text-[10px]"
                style={{
                  color: isActive ? "var(--color-background)" : "var(--color-muted)",
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="font-body text-[10px] text-muted">{selected.description}</p>
    </div>
  );
}
