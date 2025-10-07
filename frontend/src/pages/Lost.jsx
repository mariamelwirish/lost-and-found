// frontend/src/pages/Lost.jsx
import PostsList from "../components/PostsList";

export default function Lost() {
  return (
    <>
      <section className="hero">
        <div className="welcome">
          <h1>Lost items</h1>
          <p>Post about items you've lost - others on campus can help you find them!</p>
        </div>
      </section>

      {/* Everyone's posts for LOST */}
      <PostsList kind="lost" mine={false} />
    </>
  );
}
