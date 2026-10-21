import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, House, Map, Newspaper, Plus } from "lucide-react";
import type { ReactNode } from "react";

const TOP_LINKS = [
  { to: "/" as const, label: "Browse", exact: true },
  { to: "/map" as const, label: "Map" },
  { to: "/feed" as const, label: "Feed" },
  { to: "/holds" as const, label: "Holds" },
];

const BOTTOM_LINKS = [
  { to: "/" as const, label: "Browse", icon: House, exact: true },
  { to: "/map" as const, label: "Map", icon: Map },
  { to: "/feed" as const, label: "Feed", icon: Newspaper },
  { to: "/holds" as const, label: "Holds", icon: ClipboardList },
];

function usePathname() {
  return useRouterState({ select: (s) => s.location.pathname });
}

function isActive(pathname: string, to: string, exact?: boolean) {
  return exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
}

function NavLink({
  to,
  exact,
  children,
}: {
  to: "/" | "/create" | "/feed" | "/holds" | "/map";
  exact?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const on = isActive(pathname, to, exact);
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
  const pathname = usePathname();
  const opening = pathname === "/create" || pathname.startsWith("/create/");

  return (
    <div className="flex min-h-screen flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-porch focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
          <Link to="/" className="flex min-h-11 items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-porch text-paper">
              <House className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="font-display text-xl leading-none text-ink">
              Porch <span className="text-porch">Market</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {TOP_LINKS.map((item) => (
              <NavLink key={item.to} to={item.to} exact={item.exact}>
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/create"
              search={{}}
              className="inline-flex min-h-11 items-center rounded-full bg-porch px-4 text-sm font-medium text-paper hover:bg-porch-deep"
            >
              Open a porch
            </Link>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4">
        {children}
      </main>
      <footer className="mt-12 border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Porch Market · local pickup · South Florida cottage kitchens</p>
          <p>Listings you add stay on this device. Not a permit or a payment processor.</p>
        </div>
      </footer>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-5 px-1">
          {BOTTOM_LINKS.map((item) => {
            const on = isActive(pathname, item.to, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium " +
                  (on ? "text-porch" : "text-muted")
                }
              >
                <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/create"
            search={{}}
            className={
              "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium " +
              (opening ? "text-porch" : "text-muted")
            }
          >
            <Plus className="size-5" strokeWidth={1.75} aria-hidden="true" />
            Open
          </Link>
        </div>
      </nav>
    </div>
  );
}
