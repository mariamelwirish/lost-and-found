// frontend/src/pages/Lost.jsx

import { useState } from "react";
import SearchBar from "../components/SearchBar";
import PostsList from "../components/PostsList";

export default function Lost() {
  const [filters, setFilters] = useState({});
  return (
    <>
      <section className="hero">
        <div className="welcome">
          <h1>Lost items</h1>
          <p>Post about items you've lost - others on campus can help you find them!</p>
        </div>
      </section>

      <SearchBar defaultKind="lost" showKind={false} onChange={setFilters} />
      <PostsList kind="lost" mine={false} filters={filters} excludeReceived />

      <main className="container" style={{ marginTop: 24, paddingTop: 0, paddingBottom: 8 }}>
        <h3 style={{ margin: "0 0 12px" }}>Received from poster</h3>
      </main>
      <PostsList kind="lost" mine={false} filters={filters} receivedOnly compact />
    </>
  );
}
