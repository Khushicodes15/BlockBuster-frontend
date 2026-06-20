import type { BadgeTone } from "@/components/ui/Badge";

/** Map a corridor V/C ratio to a semantic tone. null => blocked/no data. */
export function vcTone(vc: number | null): BadgeTone {
  if (vc === null) return "danger";
  if (vc < 0.7) return "success";
  if (vc < 0.9) return "warning";
  return "danger";
}

/** Human label for a V/C ratio. */
export function vcLabel(vc: number | null): string {
  return vc === null ? "Blocked" : vc.toFixed(2);
}

/** Short qualitative descriptor for a V/C ratio. */
export function vcDescriptor(vc: number | null): string {
  if (vc === null) return "Blocked";
  if (vc < 0.7) return "Smooth";
  if (vc < 0.9) return "Moderate";
  return "Congested";
}

/** Hex color matching the map/legend conventions. */
export function vcColorHex(vc: number | null): string {
  if (vc === null) return "#EF4444";
  if (vc < 0.7) return "#10B981";
  if (vc < 0.9) return "#EAB308";
  return "#EF4444";
}

/** Sort key so the worst (blocked, then highest V/C) comes first. */
export function vcSeverity(vc: number | null): number {
  return vc === null ? Number.POSITIVE_INFINITY : vc;
}
