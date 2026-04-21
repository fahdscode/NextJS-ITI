import Link from "next/link";

export default function Custom404() {
  return (
    <section className="error-page">
      <div>
        <h1>404 - Page Not Found</h1>
        <p>The page you requested does not exist.</p>
        <Link className="btn primary" href="/">
          Return Home
        </Link>
      </div>
    </section>
  );
}
