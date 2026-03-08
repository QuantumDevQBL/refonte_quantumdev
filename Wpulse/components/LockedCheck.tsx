interface LockedCheckProps {
  label: string;
}

export function LockedCheck({ label }: LockedCheckProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0">
      <span className="text-lg flex-shrink-0">🔒</span>
      <p
        className="text-sm font-medium text-text-secondary select-none"
        style={{ filter: "blur(4px)" }}
      >
        {label}
      </p>
    </div>
  );
}
