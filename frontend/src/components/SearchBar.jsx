import { useState, useEffect, useRef } from "react";
import { LOCATIONS } from "../data/locations";

export default function SearchBar({ defaultKind = "", showKind = true, onChange, debounceMs = 300 }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState(defaultKind); // "", "lost", "found"
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  // local today string (YYYY-MM-DD) to prevent selecting future dates
  const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

  const timeoutRef = useRef(null);
  const firstRun = useRef(true);

  const triggerChange = () => {
    onChange?.({
      ...(q ? { q } : {}),
      ...(showKind ? { kind: kind || undefined } : {}),
      ...(location ? { location } : {}),
      ...(date ? { date } : {}),
    });
  };

  function submit(e) {
    if (e?.preventDefault) e.preventDefault();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // prevent searching for a future date
    if (date && date > todayStr) {
      alert("Date cannot be in the future");
      setDate(todayStr);
      // still trigger change with adjusted date
    }
    triggerChange();
  }

  // debounced live search
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      triggerChange();
      timeoutRef.current = null;
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [q, kind, location, date, debounceMs, showKind, onChange]);

  return (
    <form onSubmit={submit} className="searchbar">
      <div className="searchbar-inner">
          <input
            type="search"
            aria-label="Search title"
            placeholder="Search title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="search-control title"
          />

          <select
            aria-label="Search by location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="search-control location"
          >
            <option value="">Search by location</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <input
            aria-label="Filter by date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={todayStr}
            className="search-control date"
          />

          <button
            type="button"
            onClick={() => {
              // preserve kind but reset other filters
              setQ("");
              setLocation("");
              setDate("");
              // cancel any pending debounce and trigger immediate change
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              onChange?.({ ...(showKind ? { kind: kind || undefined } : {}) });
            }}
            className="search-reset"
          >
            Reset
          </button>
      </div>
    </form>
  );
}
