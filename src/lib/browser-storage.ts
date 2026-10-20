// Optional analytics must never break navigation in restricted browsers.
type StorageKind = "localStorage" | "sessionStorage";
export function stored(key: string, kind: StorageKind = "localStorage") {
  try {
    return window[kind].getItem(key);
  } catch {
    return null;
  }
}
export function store(
  key: string,
  value: string,
  kind: StorageKind = "localStorage",
) {
  try {
    window[kind].setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
export function remove(key: string, kind: StorageKind = "localStorage") {
  try {
    window[kind].removeItem(key);
  } catch {}
}
export function storedJson<T>(
  key: string,
  kind: StorageKind = "localStorage",
): T | null {
  try {
    return JSON.parse(stored(key, kind) || "null");
  } catch {
    remove(key, kind);
    return null;
  }
}
