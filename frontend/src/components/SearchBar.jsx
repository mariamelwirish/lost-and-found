import { useState } from "react";

export default function SearchBar({ defaultKind = "", showKind = true, onChange }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState(defaultKind);   // "", "lost", "found"
  const [location, setLocation] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function submit(e) {
    e.preventDefault();
    onChange?.({
      q: q || undefined,
      // only include kind if we actually show the selector
      ...(showKind ? { kind: kind || undefined } : {}),
      location: location || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  }

  function reset() {
    setQ(""); setKind(defaultKind); setLocation(""); setDateFrom(""); setDateTo("");
    onChange?.({});
  }

  return (
    <form onSubmit={submit}
      style={{ display: "grid", gap: 8, gridTemplateColumns: `1fr ${showKind ? "140px " : ""}1fr 160px 160px auto auto`, alignItems: "center", margin: "12px 0" }}>
      <input placeholder="Search title…" value={q} onChange={(e)=>setQ(e.target.value)} />
      {showKind && (
        <select value={kind} onChange={(e)=>setKind(e.target.value)}>
          <option value="">All</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
      )}
      <input placeholder="Location…" value={location} onChange={(e)=>setLocation(e.target.value)} />
      <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
      <input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
      <button type="submit">Apply</button>
      <button type="button" onClick={reset}>Reset</button>
    </form>
  );
}
