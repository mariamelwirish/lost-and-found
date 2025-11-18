import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { getUser } from "../utils/session";

export default function Home() {
  const user = useMemo(() => getUser(), []);
  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.username || user?.email?.split("@")[0] || "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("sentryTest")) {
      throw new Error("Frontend Sentry smoke test (remove query param when done)");
    }
  }, []);

  return (
    <main className="hero">
      <div className="welcome">
        Welcome{displayName ? `, ${displayName}` : ""}
      </div>

      <div className="hero-logo" aria-hidden="true">
        <img src="/lostfound.png" alt="lostfound" className="home-logo" />
      </div>
      <h1 className="sr-only">lostfound</h1>

      <div className="intro">
        <p>Lost your keys around AUB campus?</p>
        <p>Found someone's notebook on a bench?</p>
        <p>
          Lost and Found is a website to help you browse and post lost or
          found items around AUB campus.
        </p>
        <p>
          Students, faculty, and visitors who lost anything could create a post
          and have someone contact them if found and those who found anything
          can also post what and where they found it.
        </p>
        
        <div className="home-buttons">
          <Link to="/lost" className="home-btn lost-btn">
            Report Lost Item
          </Link>
          <Link to="/found" className="home-btn found-btn">
            Browse Found Items
          </Link>
        </div>
      </div>
    </main>
  );
}
