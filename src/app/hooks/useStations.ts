import { useState, useEffect, useCallback } from 'react';
import type { Station } from '../store/playerStore';
import { usePlayerStore } from '../store/playerStore';
import { CN_STATIONS } from '../../data/cn-stations';

// ── Radio Browser API ──────────────────────────────────────────────────────

const API_BASES = [
  'https://de1.api.radio-browser.info/json',
  'https://nl1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/json',
];

async function fetchWithFallback(path: string): Promise<Station[]> {
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { 'User-Agent': 'EtherRadio/1.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      // Try next base
    }
  }
  return [];
}

// ── Local CN helpers ───────────────────────────────────────────────────────

/** Filter CN_STATIONS by a comma-separated tag string (case-insensitive). */
function filterByTag(tag: string): Station[] {
  if (!tag) return CN_STATIONS;
  const needle = tag.toLowerCase().trim();
  return CN_STATIONS.filter(s =>
    s.tags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .includes(needle)
  );
}

/** Fuzzy-match CN_STATIONS by name or tags. */
function filterByQuery(query: string): Station[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return CN_STATIONS.filter(
    s =>
      s.name.toLowerCase().includes(q) ||
      s.tags.toLowerCase().includes(q)
  );
}

// ── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Returns top stations. When region === 'domestic', returns the full
 * CN_STATIONS list (sorted by votes, sliced to limit).
 */
export function useTopStations(limit = 30) {
  const region = usePlayerStore(s => s.region);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Abort any in-flight fetch when region or limit changes
    let cancelled = false;

    if (region === 'domestic') {
      const sorted = [...CN_STATIONS]
        .sort((a, b) => b.votes - a.votes)
        .slice(0, limit);
      setStations(sorted);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchWithFallback(
      `/stations/topvote?limit=${limit}&hidebroken=true&order=votes&reverse=true`
    )
      .then(data => { if (!cancelled) setStations(data); })
      .catch(() => { if (!cancelled) setError('Failed to load stations'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [limit, region]);

  return { stations, loading, error };
}

/**
 * Returns stations filtered by a genre tag.
 * Domestic: synchronous local filter. International: Radio Browser API.
 */
export function useStationsByTag(tag: string, limit = 24) {
  const region = usePlayerStore(s => s.region);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tag) return;
    let cancelled = false;

    if (region === 'domestic') {
      const results = filterByTag(tag).slice(0, limit);
      setStations(results);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setStations([]);

    fetchWithFallback(
      `/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}&hidebroken=true&order=votes&reverse=true`
    )
      .then(data => { if (!cancelled) setStations(data); })
      .catch(() => { if (!cancelled) setError('Failed to load stations'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tag, limit, region]);

  return { stations, loading, error };
}

/**
 * Returns stations by tag + optional country filter.
 * Domestic: local filter by tag only (countrycode ignored; all CN anyway).
 * International: Radio Browser API with optional country param.
 */
export function useStationsByTagAndCountry(
  tag: string,
  countrycode: string,
  limit = 30
) {
  const region = usePlayerStore(s => s.region);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tag) return;
    let cancelled = false;

    if (region === 'domestic') {
      // Country filter is irrelevant — every CN station is countrycode 'CN'
      const results = filterByTag(tag).slice(0, limit);
      setStations(results);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setStations([]);

    const apiPath =
      countrycode && countrycode !== 'ALL'
        ? `/stations/search?${new URLSearchParams({
            limit: String(limit),
            hidebroken: 'true',
            order: 'votes',
            reverse: 'true',
            tag,
            countrycode,
          })}`
        : `/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}&hidebroken=true&order=votes&reverse=true`;

    fetchWithFallback(apiPath)
      .then(data => { if (!cancelled) setStations(data); })
      .catch(() => { if (!cancelled) setError('Failed to load stations'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tag, countrycode, limit, region]);

  return { stations, loading, error };
}

/**
 * Search hook — reactive to both query and region.
 *
 * `search(q)` is a stable callback that simply updates the internal query
 * state. The actual search runs inside a `[query, region]` effect, so a
 * region toggle immediately re-runs the current query without any extra
 * plumbing in the calling page.
 *
 * Domestic: synchronous local fuzzy match — no API call, no loading flash.
 * International: Radio Browser API (async, shows loading state).
 */
export function useSearchStations() {
  const region = usePlayerStore(s => s.region);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setStations([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    if (region === 'domestic') {
      // Instant local match — no async needed
      const results = filterByQuery(query);
      setStations(results);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchWithFallback(
      `/stations/byname/${encodeURIComponent(query.trim())}?limit=24&hidebroken=true&order=votes&reverse=true`
    )
      .then(data => { if (!cancelled) setStations(data); })
      .catch(() => { if (!cancelled) setError('Search failed'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [query, region]);

  /**
   * Stable callback — calling pages just do `search(debouncedQuery)`.
   * Region-reactivity is handled entirely inside the effect above.
   */
  const search = useCallback((q: string) => {
    setQuery(q);
  }, []);

  return { stations, loading, error, query, search };
}

// ── Utilities ──────────────────────────────────────────────────────────────

/** Debounce a value by `delay` ms. */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/** Return 1–2 uppercase initials from a station name. */
export function getStationInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}
