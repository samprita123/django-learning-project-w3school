const LS_PINNED = "retrod.nav.pinned.v1";
const LS_RECENT = "retrod.nav.recent.v1";
const LS_GROUPS = "retrod.nav.groups.expanded.v1";
const MAX_RECENT = 10;

function readArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, values: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(values));
}

export function readPinnedNavNodeIds(): string[] {
  return readArray(LS_PINNED);
}

export function togglePinnedNavNodeId(nodeId: string): string[] {
  const current = readPinnedNavNodeIds();
  const next = current.includes(nodeId)
    ? current.filter((id) => id !== nodeId)
    : [...current, nodeId];
  writeArray(LS_PINNED, next);
  return next;
}

export function movePinnedNavNode(fromIndex: number, toIndex: number): string[] {
  const current = readPinnedNavNodeIds();
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= current.length ||
    toIndex >= current.length ||
    fromIndex === toIndex
  ) {
    return current;
  }
  const cloned = [...current];
  const [picked] = cloned.splice(fromIndex, 1);
  cloned.splice(toIndex, 0, picked);
  writeArray(LS_PINNED, cloned);
  return cloned;
}

export function readRecentNavNodeIds(): string[] {
  return readArray(LS_RECENT);
}

export function addRecentNavNodeId(nodeId: string): string[] {
  const current = readRecentNavNodeIds().filter((id) => id !== nodeId);
  const next = [nodeId, ...current].slice(0, MAX_RECENT);
  writeArray(LS_RECENT, next);
  return next;
}

export function clearRecentNavNodeIds(): string[] {
  writeArray(LS_RECENT, []);
  return [];
}

export function readExpandedNavGroupIds(): string[] {
  return readArray(LS_GROUPS);
}

export function toggleExpandedNavGroupId(groupId: string): string[] {
  const current = readExpandedNavGroupIds();
  const next = current.includes(groupId)
    ? current.filter((id) => id !== groupId)
    : [...current, groupId];
  writeArray(LS_GROUPS, next);
  return next;
}
