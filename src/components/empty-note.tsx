import { Link } from "@tanstack/react-router";
import type { EmptyCopy } from "@/lib/hold-ui";

export function EmptyNote({
  copy,
  compact = false,
  onAction,
}: {
  copy: EmptyCopy;
  compact?: boolean;
  onAction?: () => void;
}) {
  const actionClass =
    "mt-4 inline-flex min-h-11 items-center rounded-full bg-porch px-5 text-sm font-medium text-paper hover:bg-porch-deep";
  const action =
    copy.action && onAction ? (
      <button type="button" className={actionClass} onClick={onAction}>
        {copy.action}
      </button>
    ) : copy.action && copy.actionTo === "/create" ? (
      <Link to="/create" search={{}} className={actionClass}>
        {copy.action}
      </Link>
    ) : copy.action && copy.actionTo === "/" ? (
      <Link to="/" className={actionClass}>
        {copy.action}
      </Link>
    ) : null;

  if (compact) {
    return (
      <div className="fade-in mt-2 rounded-2xl bg-foam px-4 py-4">
        <p className="font-display text-xl text-ink">{copy.title}</p>
        <p className="mt-1 text-sm text-muted">{copy.body}</p>
        {action}
      </div>
    );
  }

  return (
    <div className="fade-in mt-3 rounded-2xl border border-dashed border-line bg-card px-5 py-8 text-center">
      <p className="font-display text-2xl text-ink">{copy.title}</p>
      <p className="mt-2 text-sm text-muted">{copy.body}</p>
      {action}
    </div>
  );
}
