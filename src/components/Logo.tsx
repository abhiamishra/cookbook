export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g fill="none" stroke="#C8613C" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="44" cy="50" r="34" />
        <path d="M44 43 C36 39 24 39 18 43 L18 63 C24 59 36 59 44 63" />
        <path d="M44 43 C52 39 64 39 70 43 L70 63 C64 59 52 59 44 63" />
        <path d="M44 43 L44 63" />
      </g>
      <text
        x="88"
        y="64"
        fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif"
        fontWeight="500"
        fontSize="40"
        letterSpacing="-0.5"
        fill="#33302E"
      >
        cookbook
      </text>
    </svg>
  );
}
