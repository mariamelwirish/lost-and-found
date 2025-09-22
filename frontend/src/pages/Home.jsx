import { useMemo } from "react";
import { getUser } from "../utils/session";

function Home() {
  const user = useMemo(() => getUser(), []);
  const displayName =
    user?.name ||
    user?.username ||
    (user?.email ? user.email.split("@")[0] : "");

  return (
    <main className="hero">
      {/* Optional small line above the big title */}
      <div className="welcome">
        Welcome{displayName ? `, ${displayName}` : ""} 👋
      </div>

      <h1 className="title">
        lostfound <span className="badge">⤴</span>
      </h1>

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
export default Home;
