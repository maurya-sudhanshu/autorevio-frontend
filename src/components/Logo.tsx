import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "icon" | "stacked";
  size?: "sm" | "md" | "lg" | "xl";
  darkMode?: boolean;
  showTagline?: boolean;
  href?: string;
  className?: string;
}

export function Logo({
  variant = "full",
  size = "md",
  darkMode = false,
  showTagline = false,
  href,
  className = "",
}: LogoProps) {
  const iconHeights = {
    sm: "h-7",
    md: "h-9",
    lg: "h-11",
    xl: "h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const logoContent = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 110 120"
        className={`${iconHeights[size]} w-auto flex-shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoArGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        <g fill="#F59E0B" transform="translate(56, 4)">
          <polygon points="5,0 6.5,3 9.8,3.5 7.4,5.8 8,9.1 5,7.5 2,9.1 2.6,5.8 0.2,3.5 3.5,3" transform="translate(0,0)"/>
          <polygon points="5,0 6.5,3 9.8,3.5 7.4,5.8 8,9.1 5,7.5 2,9.1 2.6,5.8 0.2,3.5 3.5,3" transform="translate(9,0)"/>
          <polygon points="5,0 6.5,3 9.8,3.5 7.4,5.8 8,9.1 5,7.5 2,9.1 2.6,5.8 0.2,3.5 3.5,3" transform="translate(18,0)"/>
          <polygon points="5,0 6.5,3 9.8,3.5 7.4,5.8 8,9.1 5,7.5 2,9.1 2.6,5.8 0.2,3.5 3.5,3" transform="translate(27,0)"/>
          <polygon points="5,0 6.5,3 9.8,3.5 7.4,5.8 8,9.1 5,7.5 2,9.1 2.6,5.8 0.2,3.5 3.5,3" transform="translate(36,0)"/>
        </g>
        <path
          d="M 45 16 L 5 99 C 3 103 6 108 11 108 L 38 108 C 42 108 45 105 47 101 L 54 85 L 28 85 C 25 85 23 82 24 79 L 36 54 C 37 51 40 50 43 50 L 68 50 L 56 25 C 54 20 48 16 45 16 Z"
          fill="url(#logoArGrad)"
        />
        <circle cx="34" cy="68" r="2.5" fill="#FFFFFF" />
        <circle cx="42" cy="68" r="2.5" fill="#FFFFFF" />
        <circle cx="50" cy="68" r="2.5" fill="#FFFFFF" />
        <path
          d="M 52 16 C 55 16 60 16 65 16 C 85 16 100 28 100 49 C 100 66 88 78 72 81 L 95 105 C 98 108 96 112 91 112 L 74 112 C 71 112 68 110 66 108 L 48 87 C 46 85 48 81 51 81 L 64 81 C 74 81 82 74 82 62 C 82 50 74 43 64 43 L 45 43 C 42 43 40 41 41 38 L 49 21 C 50 18 51 16 52 16 Z"
          fill={darkMode ? "#F8FAFC" : "#1E293B"}
        />
      </svg>

      {variant !== "icon" && (
        <div className="flex flex-col justify-center">
          <div className={`font-extrabold tracking-tight ${textSizes[size]} leading-none`}>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              auto
            </span>
            <span className={darkMode ? "text-white" : "text-slate-900"}>
              revio
            </span>
          </div>
          {showTagline && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="h-[1px] w-3 bg-blue-600 inline-block" />
              <span className={`text-[9px] font-bold tracking-widest uppercase ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                Reviews. Connect. Grow.
              </span>
              <span className="h-[1px] w-3 bg-blue-600 inline-block" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
