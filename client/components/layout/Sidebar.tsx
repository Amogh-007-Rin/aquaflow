"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/sensors", label: "Sensors" },
  { href: "/predictions", label: "Predictions" },
  { href: "/alerts", label: "Alerts" },
  { href: "/reports", label: "Reports" },
  { href: "/satellite", label: "Satellite" },
  { href: "/facilities", label: "Facilities" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 border-r border-[#1a2d4a] bg-[#060f1f] p-4">
      <h1 className="mb-6 text-xl font-semibold text-cyan-300">Aquaflow</h1>
      <nav className="space-y-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "block rounded-md px-3 py-2 text-sm",
              pathname === item.href ? "bg-cyan-500/20 text-cyan-200 glow" : "text-slate-300 hover:bg-slate-800",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
