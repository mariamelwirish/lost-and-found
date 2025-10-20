import { useState, useEffect, useRef } from "react";
import { LOCATIONS } from "../data/locations";

export default function SearchBar({ defaultKind = "", showKind = true, onChange, debounceMs = 300 }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState(defaultKind); // "", "lost", "found"
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

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
    <form onSubmit={submit} style={{ margin: "0 0 8px 0" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 920, alignItems: "center" }}>
          <input
            aria-label="Search title"
            placeholder="Search title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              flex: 1.6,
              minWidth: 0,
              padding: "12px 16px",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              fontSize: 15,
              outline: "none",
              background: "#ffffff",
              boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
            }}
          />

          <select
            aria-label="Search by location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "12px 16px",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              fontSize: 15,
              outline: "none",
              background: "#ffffff",
              boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
            }}
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
            style={{
              flex: "0 0 150px",
              /* match vertical padding of the other inputs so heights align */
              padding: "12px 16px",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              fontSize: 15,
              outline: "none",
              background: "#ffffff",
              boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
            }}
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
            style={{
              flex: "0 0 60px",
              height: "44px",
              background: "transparent",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              color: "#333",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              alignSelf: "center",
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}
