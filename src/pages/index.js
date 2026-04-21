import HomeComponent from "@/components/HomeComponent";

export default function Home() {
  return (
    <section className="home-section">
      <h1>Products Dashboard</h1>
      <p>
        Explore products, filter by brand/category, and perform full CRUD
        operations backed by json-server.
      </p>
      <HomeComponent />
    </section>
  );
}
