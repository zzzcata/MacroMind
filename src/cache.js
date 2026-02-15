import fs from "fs";

const CACHE_FILE = "./cache.json";
const CACHE_TTL_MS = 5 * 60 * 1000;

function readCacheFile() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  const raw = fs.readFileSync(CACHE_FILE, "utf-8");
  return raw ? JSON.parse(raw) : {};
}

function writeCacheFile(data) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

export function getCached(key) {
  const cache = readCacheFile();
  const entry = cache[key];
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL_MS) {
    delete cache[key];
    writeCacheFile(cache);
    return null;
  }

  return entry.data;
}

export function setCached(key, data) {
  const cache = readCacheFile();
  cache[key] = {
    data,
    timestamp: Date.now()
  };
  writeCacheFile(cache);
}
