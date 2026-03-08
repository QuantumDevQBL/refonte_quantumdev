export function ScanAnimation() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-20 h-20">
        {/* Outer pulse rings */}
        <div className="absolute inset-0 rounded-full border-2 border-primary-500 animate-ping opacity-30" />
        <div
          className="absolute inset-0 rounded-full border-2 border-primary-500 animate-ping opacity-20"
          style={{ animationDelay: "0.5s" }}
        />
        {/* Inner circle with heartbeat icon */}
        <div className="absolute inset-0 rounded-full border-2 border-primary-600 flex items-center justify-center bg-bg-card">
          <svg
            width="32"
            height="22"
            viewBox="0 0 32 22"
            fill="none"
            className="text-primary-500"
          >
            <path
              d="M1 11 L6 11 L9 3 L12 19 L15 8 L18 14 L21 11 L31 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
