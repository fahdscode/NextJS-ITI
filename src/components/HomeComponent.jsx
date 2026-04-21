import Link from "next/link";

const HomeComponent = () => {
  return (
    <div className="home-links">
      <Link href="/products" className="cta-link">
        Go To Products
      </Link>
      <Link href="/products/1" className="cta-link secondary">
        Open Product #1
      </Link>
    </div>
  );
};

export default HomeComponent;