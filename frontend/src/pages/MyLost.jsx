// frontend/src/pages/MyLost.jsx

import { useState } from "react";
import SearchBar from "../components/SearchBar";
import PostsList from "../components/PostsList";

export default function MyLost() {
  const [filters, setFilters] = useState({});
  return (
    <>
      <section className="hero">
        <div className="welcome">
          <h1>My Lost Posts</h1>
          <p>Only the items you posted.</p>
        </div>
      </section>

      <SearchBar defaultKind="lost" showKind={false} onChange={setFilters} />
      <PostsList kind="lost" mine={true} filters={filters} />
    </>
  );
}
