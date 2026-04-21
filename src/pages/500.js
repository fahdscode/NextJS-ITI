import Link from "next/link";

export default function Custom500() {
  return (
    <section className="error-page">
      <div>
        <h1>500 - Server Error</h1>
        <p>Something unexpected happened while loading this page.</p>
        <Link className="btn primary" href="/">
          Return Home
        </Link>
      </div>
    </section>
  );
}
