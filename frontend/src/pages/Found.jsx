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
      <PostsList kind="found" mine={false} filters={filters} />
    </>
  );
}
