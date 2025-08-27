
export function AppLogo() {
  return (
    <div className="flex items-center gap-2 group">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-primary building-icon"
            aria-hidden="true"
        >
            <path className="building-part" d="M4 22h16" />
            <path className="building-part" d="M6 22V8l6-4 6 4v14" />
            <path className="building-part" d="M12 22V12" />
            <path className="building-part" d="M10 9h4" />
            <path className="building-part" d="M10 13h4" />
            <path className="building-part" d="M10 17h4" />
        </svg>
      <h1 className="text-xl font-bold font-headline text-primary">Building Hub</h1>
    </div>
  );
}
