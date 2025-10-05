// frontend/src/pages/Found.jsx
import PostsList from "../components/PostsList";

export default function Found() {
  return (
    <>
      <section className="hero">
        <div className="welcome">
          <h1>Found items</h1>
          <p>Browse recent reports.</p>
        </div>
      </section>

      {/* Everyone's posts for FOUND */}
      <PostsList kind="found" mine={false} />
    </>
  );
}
