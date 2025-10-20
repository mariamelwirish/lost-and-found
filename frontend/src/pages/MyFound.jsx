// frontend/src/pages/MyFound.jsx

import { useState } from "react";
import SearchBar from "../components/SearchBar";
import PostsList from "../components/PostsList";

export default function MyFound() {
  const [filters, setFilters] = useState({});
  return (
    <>
      <section className="hero">
        <div className="welcome">
          <h1>My Found Posts</h1>
          <p>Only the items you posted.</p>
        </div>
      </section>

      <SearchBar defaultKind="found" showKind={false} onChange={setFilters} />
      <PostsList kind="found" mine={true} filters={filters} />
    </>
  );
}
