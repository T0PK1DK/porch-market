import { useEffect, useState, type ComponentType } from "react";
import type { PublicMapPin } from "@/lib/geo";

export type StreetMapProps = {
  pins: PublicMapPin[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  pick?: { lat: number; lng: number } | null;
  onPick?: (point: { lat: number; lng: number }) => void;
};

export function StreetMap(props: StreetMapProps) {
  const [Canvas, setCanvas] = useState<ComponentType<StreetMapProps> | null>(null);

  useEffect(() => {
    let alive = true;
    import("./street-map-canvas").then((mod) => {
      if (alive) setCanvas(() => mod.StreetMapCanvas);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!Canvas) {
    return (
      <div className="grid h-full min-h-[280px] place-items-center bg-foam text-sm text-muted">
        Opening the street map…
      </div>
    );
  }

  return <Canvas {...props} />;
}
