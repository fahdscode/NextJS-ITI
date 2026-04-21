import HomeComponent from "@/components/HomeComponent";

export default function Home() {
  return (
    <section className="home-section">
      <h1>Products Dashboard</h1>
      <p>
        Explore products with MongoDB + Mongoose CRUD APIs, ISR product pages,
        and an SSR news route with random toast messages.
      </p>
      <HomeComponent />
    </section>
  );
}
