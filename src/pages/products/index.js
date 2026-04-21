import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getProducts } from "@/lib/productsService";

export default function ProductsPage({ initialProducts, brandOptions, categoryOptions }) {
  const [products, setProducts] = useState(initialProducts);
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    brand: "",
    category: "",
    thumbnail: "",
    stock: "",
    rating: "",
  });

  const hasProducts = useMemo(() => products.length > 0, [products]);

  async function applyFilter(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (category) params.set("category", category);

    const response = await fetch(`/api/products?${params.toString()}`);
    const data = await response.json();
    setProducts(Array.isArray(data) ? data : []);
  }

  async function resetFilter() {
    setBrand("");
    setCategory("");
    setProducts(initialProducts);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setStatus("Creating product...");

    const payload = {
      ...form,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      rating: Number(form.rating || 0),
    };

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setStatus("Create failed. Make sure json-server is running on port 3001.");
      return;
    }

    const created = await response.json();
    setProducts((current) => [created, ...current]);
    setForm({
      title: "",
      description: "",
      price: "",
      brand: "",
      category: "",
      thumbnail: "",
      stock: "",
      rating: "",
    });
    setStatus("Product created successfully.");
  }

  async function handleDelete(id) {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("Delete failed. Make sure json-server is running on port 3001.");
      return;
    }

    setProducts((current) => current.filter((product) => product.id !== id));
    setStatus(`Product ${id} deleted.`);
  }

  return (
    <section>
      <h1>Products (SSG)</h1>
      <p>Data is statically fetched, then filtered and edited through API routes.</p>

      <form className="toolbar" onSubmit={applyFilter}>
        <select value={brand} onChange={(event) => setBrand(event.target.value)}>
          <option value="">Filter by brand</option>
          {brandOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">Filter by category</option>
          {categoryOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <div>
          <button className="btn primary" type="submit">
            Apply
          </button>{" "}
          <button className="btn" type="button" onClick={resetFilter}>
            Reset
          </button>
        </div>
      </form>

      <form className="create-form" onSubmit={handleCreate}>
        <h2>Add New Product</h2>
        <div className="create-grid">
          <input
            value={form.title}
            onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))}
            placeholder="Title"
            required
          />
          <input
            value={form.thumbnail}
            onChange={(event) => setForm((f) => ({ ...f, thumbnail: event.target.value }))}
            placeholder="Thumbnail URL"
            required
          />
          <input
            value={form.brand}
            onChange={(event) => setForm((f) => ({ ...f, brand: event.target.value }))}
            placeholder="Brand"
            required
          />
          <input
            value={form.category}
            onChange={(event) => setForm((f) => ({ ...f, category: event.target.value }))}
            placeholder="Category"
            required
          />
          <input
            value={form.price}
            onChange={(event) => setForm((f) => ({ ...f, price: event.target.value }))}
            placeholder="Price"
            type="number"
            min="0"
            required
          />
          <input
            value={form.stock}
            onChange={(event) => setForm((f) => ({ ...f, stock: event.target.value }))}
            placeholder="Stock"
            type="number"
            min="0"
            required
          />
          <input
            value={form.rating}
            onChange={(event) => setForm((f) => ({ ...f, rating: event.target.value }))}
            placeholder="Rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            required
          />
          <textarea
            className="full"
            value={form.description}
            onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))}
            placeholder="Description"
            rows={3}
            required
          />
        </div>
        <button className="btn primary" type="submit">
          Create
        </button>
      </form>

      {status ? <p>{status}</p> : null}

      {!hasProducts ? <p>No products found for current filter.</p> : null}

      <div className="products-grid">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <div className="image-frame">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 250px"
              />
            </div>
            <h3>{product.title}</h3>
            <p>Brand: {product.brand}</p>
            <p>Category: {product.category}</p>
            <p>Price: ${product.price}</p>
            <div className="card-actions">
              <Link className="btn" href={`/products/${product.id}`}>
                View
              </Link>
              <button className="btn danger" type="button" onClick={() => handleDelete(product.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export async function getStaticProps() {
  const products = await getProducts();

  const brandOptions = [...new Set(products.map((product) => product.brand))].sort();
  const categoryOptions = [...new Set(products.map((product) => product.category))].sort();

  return {
    props: {
      initialProducts: products,
      brandOptions,
      categoryOptions,
    },
    revalidate: 60,
  };
}
