export default function SculptureFallback() {
  return <svg className="sculpture-fallback" viewBox="0 0 600 600" aria-hidden="true">
    <defs>
      <linearGradient id="knot-metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#32101e" /><stop offset=".25" stopColor="#b77889" /><stop offset=".43" stopColor="#6b263b" /><stop offset=".65" stopColor="#35101f" /><stop offset=".85" stopColor="#a46076" /><stop offset="1" stopColor="#512033" /></linearGradient>
      <linearGradient id="knot-light" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e5bfc8" /><stop offset=".4" stopColor="#8a3e56" /><stop offset="1" stopColor="#431426" /></linearGradient>
    </defs>
    <ellipse cx="300" cy="310" rx="251" ry="139" fill="none" stroke="#9b7b84" strokeWidth="1" transform="rotate(-28 300 310)" opacity=".5" />
    <path d="M295 133 C445 39 552 218 415 311 C282 402 90 371 119 235 C148 99 367 155 408 310 C449 465 235 523 184 383 C133 243 218 115 295 133Z" fill="none" stroke="url(#knot-metal)" strokeWidth="69" strokeLinecap="round" />
    <path d="M295 133 C445 39 552 218 415 311 C355 351 293 365 239 359" fill="none" stroke="url(#knot-light)" strokeWidth="68" strokeLinecap="round" />
    <circle cx="515" cy="206" r="7" fill="#6b263b" />
  </svg>;
}
