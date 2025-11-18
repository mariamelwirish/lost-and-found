import "./SmokeTestOverlay.css";

export default function SmokeTestOverlay() {
  return (
    <div className="sentry-smoke-overlay">
      <div className="sentry-smoke-card">
        <h1>Sentry Smoke Test Active</h1>
        <p>
          The app intentionally threw an error because the <code>?sentryTest=1</code> flag
          is present in the URL. You should see this event in your Sentry dashboard.
        </p>
        <p>Remove the query parameter and reload to return to normal behavior.</p>
      </div>
    </div>
  );
}
