import { Link, useRouterState } from "@tanstack/react-router";
import { House } from "lucide-react";
import type { ReactNode } from "react";

function NavLink({
  to,
  exact,
  children,
}: {
  to: "/" | "/create";
  exact?: boolean;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const on = exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      className={
        "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium " +
        (on ? "bg-foam text-porch" : "text-ink hover:bg-foam")
      }
    >
      {children}
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-porch focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex min-h-11 items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-porch text-paper">
              <House className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="font-display text-xl leading-none text-ink">
              Porch <span className="text-porch">Market</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Primary">
            <NavLink to="/" exact>
              Browse
            </NavLink>
            <Link
              to="/create"
              className="inline-flex min-h-11 items-center rounded-full bg-porch px-4 text-sm font-medium text-paper hover:bg-porch-deep"
            >
              <span className="sm:hidden">Open</span>
              <span className="hidden sm:inline">Open a porch</span>
            </Link>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4">
        {children}
      </main>
      <footer className="mt-16 border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Porch Market · local pickup · South Florida cottage kitchens</p>
          <p>Listings you add stay on this device. Not a permit or a payment processor.</p>
        </div>
      </footer>
    </div>
  );
}
