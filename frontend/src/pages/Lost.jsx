// frontend/src/pages/Lost.jsx
import PostsList from "../components/PostsList";

export default function Lost() {
  return (
    <>
      <section className="hero">
        <div className="welcome">
          <h1>Lost items</h1>
          <p>Browse recent reports.</p>
        </div>
      </section>

      {/* Everyone's posts for LOST */}
      <PostsList kind="lost" mine={false} />
    </>
  );
}
