// frontend/src/pages/MyLost.jsx
import PostsList from "../components/PostsList";

export default function MyLost() {
  return (
    <>
      <section className="hero">
        <div className="welcome">
          <h1>My Lost Posts</h1>
          <p>Only the items you posted.</p>
        </div>
      </section>

      <PostsList kind="lost" mine={true} />
    </>
  );
}
