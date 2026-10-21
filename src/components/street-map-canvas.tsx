import { useEffect, useRef } from "react";
import {
  AttributionControl,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type MapMouseEvent,
} from "maplibre-gl";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import { OPENFREEMAP_STYLE, SOUTH_FLORIDA, type PublicMapPin } from "@/lib/geo";

setWorkerUrl(mapWorkerUrl);

const KIND_COLOR: Record<PublicMapPin["kind"], string> = {
  home: "#1e4630",
  mobile: "#c2410c",
  shop: "#163626",
};

const KIND_GLYPH: Record<PublicMapPin["kind"], string> = {
  home: "H",
  mobile: "T",
  shop: "S",
};

export function StreetMapCanvas({
  pins,
  activeId,
  onSelect,
  pick,
  onPick,
}: {
  pins: PublicMapPin[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  pick?: { lat: number; lng: number } | null;
  onPick?: (point: { lat: number; lng: number }) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const pickMarker = useRef<Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  const onPickRef = useRef(onPick);
  onSelectRef.current = onSelect;
  onPickRef.current = onPick;

  useEffect(() => {
    if (!root.current || mapRef.current) return;
    const map = new MapLibreMap({
      container: root.current,
      style: OPENFREEMAP_STYLE,
      center: SOUTH_FLORIDA.center,
      zoom: SOUTH_FLORIDA.zoom,
      attributionControl: false,
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution: "© OpenStreetMap contributors · OpenFreeMap",
      }),
    );
    map.on("click", (event: MapMouseEvent) => {
      onPickRef.current?.({ lat: event.lngLat.lat, lng: event.lngLat.lng });
    });
    const resize = () => map.resize();
    map.on("load", resize);
    map.once("idle", resize);
    const observer = new ResizeObserver(resize);
    observer.observe(root.current);
    mapRef.current = map;
    return () => {
      observer.disconnect();
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      pickMarker.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markers.current.forEach((marker) => marker.remove());
    markers.current = pins.map((pin) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "porch-map-pin";
      el.textContent = KIND_GLYPH[pin.kind];
      el.setAttribute("aria-label", `${pin.name}, ${pin.kind}`);
      el.style.cssText = [
        "width:32px",
        "height:32px",
        "border-radius:999px",
        `background:${KIND_COLOR[pin.kind]}`,
        "color:#f3eee4",
        "border:2px solid #fffdf8",
        "font:600 12px Outfit,system-ui,sans-serif",
        "box-shadow:0 6px 16px rgb(28 25 21 / 0.18)",
        "cursor:pointer",
        activeId === pin.vendorId ? "transform:scale(1.12)" : "",
      ].join(";");
      el.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectRef.current?.(pin.vendorId);
      });
      return new Marker({ element: el, anchor: "center" })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
    });
  }, [pins, activeId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    pickMarker.current?.remove();
    pickMarker.current = null;
    if (!pick) return;
    const el = document.createElement("div");
    el.style.cssText =
      "width:18px;height:18px;border-radius:999px;background:#c2410c;border:3px solid #fffdf8;box-shadow:0 4px 12px rgb(28 25 21 / 0.2)";
    pickMarker.current = new Marker({ element: el, anchor: "center" })
      .setLngLat([pick.lng, pick.lat])
      .addTo(map);
  }, [pick]);

  return <div ref={root} className="h-full w-full" />;
}
