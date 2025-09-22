import { useMemo } from "react";
import { getUser } from "../utils/session";

export default function Home() {
  const user = useMemo(() => getUser(), []);
  const displayName =
    (user?.name && user.name.trim()) ||
    (user?.username && user.username.trim()) ||
    (user?.email ? user.email.split("@")[0] : "");

  return (
    <main className="hero">
      <div className="welcome">
        Welcome{displayName ? `, ${displayName}` : ""} 👋
      </div>

      {/* Logo instead of text title */}
      <div className="hero-logo" aria-hidden="true">
        {/* Use the same logo you already use on auth pages */}
        {/* If your file name is different, update the src path */}
        <img src="/lostfound.png" alt="lostfound" className="home-logo" />
      </div>
      {/* Keep an accessible title for screen readers */}
      <h1 className="sr-only">lostfound</h1>

      <div className="intro">
        <p>Lost your keys around AUB campus?</p>
        <p>Found someone’s notebook on a bench?</p>
        <p>
          Lost and Found is a website to help you browse and post lost or
          found items around AUB campus.
        </p>
        <p>
          Students, faculty, and visitors who lost anything could create a post
          and have someone contact them if found and those who found anything
          can also post what and where they found it.
        </p>
      </div>
    </main>
  );
}
