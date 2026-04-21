import Link from "next/link";

const TOASTS = [
  "Breaking: weekend mega sale is live",
  "Flash update: free shipping for premium members",
  "Hot drop: new arrivals just landed",
  "Today only: checkout bonus unlocked",
  "News alert: stock refill on top-rated products",
];

const HEADLINES = [
  "Market pulse: demand for smart products rises",
  "Tech trend: eco packaging adoption accelerates",
  "Consumer watch: shoppers prioritize quality and value",
  "Retail report: digital-first experiences dominate",
  "Insight: AI-based recommendations increase conversions",
];

function randomFrom(values) {
  return values[Math.floor(Math.random() * values.length)];
}

export default function NewsPage({ toast, headline, generatedAt }) {
  return (
    <section>
      <h1>News (SSR)</h1>
      <p>This page is server-rendered on every request.</p>

      <div className="create-form">
        <h2>Random Toast</h2>
        <p>{toast}</p>
      </div>

      <div className="create-form">
        <h2>Headline</h2>
        <p>{headline}</p>
        <p>Generated at: {generatedAt}</p>
      </div>

      <Link className="btn" href="/products">
        Back to products
      </Link>
    </section>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      toast: randomFrom(TOASTS),
      headline: randomFrom(HEADLINES),
      generatedAt: new Date().toISOString(),
    },
  };
}
