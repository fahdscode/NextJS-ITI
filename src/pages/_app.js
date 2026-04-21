import "@/styles/globals.css";
import Link from "next/link";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const hideChrome = ["/404", "/500", "/_error"].includes(router.pathname);

  if (hideChrome) {
    return <Component {...pageProps} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="nav-wrap">
          <Link href="/" className="nav-logo">
            Fahd&apos;s Store
          </Link>
          <div className="nav-links">
            <Link href="/products">Products</Link>
            <Link href="/news">News</Link>
          </div>
        </nav>
      </header>
      <main className="page-container">
        <Component {...pageProps} />
      </main>
      <footer className="app-footer">Fahd&apos;s Code Prod.</footer>
    </div>
  );
}
