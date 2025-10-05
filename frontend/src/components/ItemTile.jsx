import React from "react";

export default function ItemTile({ item }) {
  const { title, image, location, status, createdAt } = item;
  const date = createdAt ? new Date(createdAt) : null;

  return (
    <article className="lf-card">
      <div className="lf-card-media">
        {image ? (
          <img src={image} alt={title} loading="lazy" />
        ) : (
          <div className="lf-card-media-fallback">No image</div>
        )}
      </div>

      <div className="lf-card-body">
        <div className="lf-card-head">
          <h3 className="lf-card-title" title={title}>{title}</h3>
          <span
            className={
              "lf-badge " +
              (status === "found"
                ? "lf-badge-green"
                : status === "lost"
                ? "lf-badge-amber"
                : "lf-badge-gray")
            }
          >
            {String(status || "").toUpperCase()}
          </span>
        </div>

        <div className="lf-card-meta">
          <span>📍 {location}</span>
          {date && <span>&nbsp;•&nbsp;{date.toLocaleDateString()}</span>}
        </div>
      </div>
    </article>
  );
}
