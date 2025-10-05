// frontend/src/pages/MyFound.jsx
import PostsList from "../components/PostsList";

export default function MyFound() {
  return (
    <>
      <section className="hero">
        <div className="welcome">
          <h1>My Found Posts</h1>
          <p>Only the items you posted.</p>
        </div>
      </section>

      <PostsList kind="found" mine={true} />
    </>
  );
}
