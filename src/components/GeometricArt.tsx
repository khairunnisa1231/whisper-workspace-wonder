
import React from "react";

const shapes = [
  // Each string represents an SVG. These are simplified and stylized representations.
  // You can expand or swap these with more complex ones later!
  (
    <svg width="72" height="72" viewBox="0 0 72 72" key="s1">
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff5582" />
          <stop offset="100%" stopColor="#272862" />
        </linearGradient>
      </defs>
      <rect width="72" height="72" fill="url(#grad1)" />
      <circle cx="36" cy="36" r="22" fill="#fff0" stroke="#E5DEFF" strokeWidth="12" />
    </svg>
  ),
  (
    <svg width="72" height="72" viewBox="0 0 72 72" key="s2">
      <defs>
        <linearGradient id="grad2" x1="0" y1="72" x2="72" y2="0">
          <stop offset="0%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#6E59A5" />
        </linearGradient>
      </defs>
      <rect width="72" height="72" fill="#fff"/>
      <polygon points="36,8 68,64 4,64" fill="url(#grad2)" />
    </svg>
  ),
  (
    <svg width="72" height="72" viewBox="0 0 72 72" key="s3">
      <defs>
        <linearGradient id="grad3" x1="0" y1="0" x2="72" y2="72">
          <stop offset="0%" stopColor="#7E69AB" />
          <stop offset="100%" stopColor="#ffdee2" />
        </linearGradient>
      </defs>
      <rect width="72" height="72" fill="url(#grad3)" />
      <circle cx="36" cy="36" r="24" fill="none" stroke="#ff5582" strokeWidth="12" />
    </svg>
  ),
  (
    <svg width="72" height="72" viewBox="0 0 72 72" key="s4">
      <defs>
        <linearGradient id="grad4" x1="0" y1="72" x2="72" y2="0">
          <stop offset="0%" stopColor="#FFA99F" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="72" height="72" fill="url(#grad4)" />
      <rect x="16" y="16" width="40" height="40" fill="#fff0" stroke="#ff5582" strokeWidth="8" />
    </svg>
  ),
  (
    <svg width="72" height="72" viewBox="0 0 72 72" key="s5">
      <defs>
        <linearGradient id="grad5" x1="72" y1="0" x2="0" y2="72">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <rect width="72" height="72" fill="#fff"/>
      <circle cx="36" cy="36" r="24" fill="url(#grad5)" />
    </svg>
  ),
];

export const GeometricArt: React.FC = () => (
  <div className="w-full overflow-x-auto py-6 flex items-center gap-6 px-2 md:px-8">
    {shapes.map((svg, i) => (
      <div
        key={i}
        className="rounded-lg bg-white shadow-sm flex-shrink-0"
        style={{ width: 72, height: 72, minWidth: 72 }}
      >
        {svg}
      </div>
    ))}
  </div>
);
