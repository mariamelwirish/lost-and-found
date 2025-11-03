// frontend/src/pages/Found.jsx

import { useState } from "react";
import SearchBar from "../components/SearchBar";
import PostsList from "../components/PostsList";

export default function Found() {
  const [filters, setFilters] = useState({});
  return (
    <>
      <section className="hero">
        <div className="welcome">
          <h1>Found items</h1>
          <p>Browse items found on campus - see if yours is here!</p>
        </div>
      </section>

      <SearchBar defaultKind="found" showKind={false} onChange={setFilters} />
      <PostsList kind="found" mine={false} filters={filters} excludeReceived />

      <main className="container" style={{ marginTop: 24 }}>
        <h3 style={{ margin: "0 0 12px" }}>Received from poster</h3>
      </main>
      <PostsList kind="found" mine={false} filters={filters} receivedOnly />
    </>
  );
}
