interface LogoIconProps {
  className?: string;
  strokeWidth?: number;
}

export function LogoIcon({ className = 'h-8 w-8', strokeWidth = 4.5 }: LogoIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Asian Grocery NG"
      role="img"
    >
      {/* Chopstick 1 */}
      <line x1="29" y1="8" x2="51" y2="42" />
      {/* Chopstick 2 */}
      <line x1="45" y1="6" x2="67" y2="42" />
      {/* Bowl rim */}
      <line x1="14" y1="44" x2="86" y2="44" />
      {/* Bowl body */}
      <path d="M14 44 Q12 82 50 85 Q88 82 86 44" />
      {/* Bowl base foot */}
      <line x1="40" y1="85" x2="60" y2="85" />
      <line x1="35" y1="91" x2="65" y2="91" />
      {/* Noodle wave 1 */}
      <path d="M28 56 Q36 52 44 56 Q52 60 60 56 Q68 52 74 56" />
      {/* Noodle wave 2 */}
      <path d="M28 67 Q36 63 44 67 Q52 71 60 67 Q68 63 74 67" />
    </svg>
  );
}
