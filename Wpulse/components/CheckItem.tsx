interface CheckItemProps {
  label: string;
  passed: boolean;
  detail?: string;
}

export function CheckItem({ label, passed, detail }: CheckItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-b-0">
      <span className="text-lg flex-shrink-0 mt-0.5">
        {passed ? "✅" : "❌"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {detail && (
          <p className="text-xs text-text-muted mt-0.5">{detail}</p>
        )}
      </div>
    </div>
  );
}
