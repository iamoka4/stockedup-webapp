export interface Coords {
  latitude: number;
  longitude: number;
}

export type LocationPermission = "granted" | "prompt" | "denied" | "unsupported";
export type GeoFailure = "denied" | "unavailable" | "timeout" | "unsupported";

export class GeoError extends Error {
  kind: GeoFailure;
  constructor(kind: GeoFailure) {
    super(`Geolocation failed: ${kind}`);
    this.name = "GeoError";
    this.kind = kind;
  }
}

export function geolocationSupported(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

// Reads the permission without triggering the browser prompt.
export async function getPermissionState(): Promise<LocationPermission> {
  if (!geolocationSupported()) return "unsupported";
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    // Browsers that can't report geolocation permission (older Safari):
    // treat as "not asked yet" and let getPosition() do the asking.
    return "prompt";
  }
}

// Triggers the native prompt if the permission hasn't been decided yet.
export function getPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!geolocationSupported()) {
      reject(new GeoError("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      (err) =>
        reject(
          new GeoError(
            err.code === err.PERMISSION_DENIED
              ? "denied"
              : err.code === err.TIMEOUT
                ? "timeout"
                : "unavailable"
          )
        ),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 }
    );
  });
}