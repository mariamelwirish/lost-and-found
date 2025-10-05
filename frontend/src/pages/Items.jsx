// src/pages/Items.jsx
import React from "react";
import ItemTile from "../components/ItemTile.jsx"; // ensure filename matches
import { getItems } from "../api.js";
import { Link } from "react-router-dom";

export default function ItemsPage({ status = "lost", mineDefault = false }) {
  const [tabMine, setTabMine] = React.useState(mineDefault);
  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const load = async (nextPage = 1, reset = false) => {
    setLoading(true);
    setError("");
    try {
      const { items: newItems, hasMore } = await getItems({
        page: nextPage,
        limit: 18,
        status,
        mine: tabMine,
      });
      setItems(prev => (reset ? newItems : [...prev, ...newItems]));
      setHasMore(hasMore);
      setPage(nextPage);
    } catch (e) {
      setError(e?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabMine, status]);

  return (
    <div className="lf-wrap">
      <div className="lf-tabs">
        <button
          className={"lf-tab " + (!tabMine ? "is-active" : "")}
          onClick={() => setTabMine(false)}
        >
          Posts
        </button>
        <button
          className={"lf-tab " + (tabMine ? "is-active" : "")}
          onClick={() => setTabMine(true)}
        >
          My Posts
        </button>
      </div>

      {error && <div className="lf-error">{error}</div>}
      {!error && items.length === 0 && !loading && (
        <div className="lf-empty">No items yet.</div>
      )}

      <section className="lf-grid">
        {items.map(it => (
          <ItemTile key={it.id} item={it} />
        ))}
      </section>

      {/* Floating Create Post button */}
      <Link className="lf-fab" to="/create" aria-label="Create Post">＋</Link>

      <div className="lf-actions">
        {hasMore && !loading && (
          <button className="btn btn-primary lf-load" onClick={() => load(page + 1)}>
            Load more
          </button>
        )}
        {loading && <div className="lf-loading">Loading…</div>}
      </div>
    </div>
  );
}
