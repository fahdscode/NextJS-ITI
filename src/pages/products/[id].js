import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getProductById, getProducts } from "@/lib/productsService";

export default function ProductDetailsPage({ product }) {
  const [form, setForm] = useState({
    title: product.title,
    description: product.description,
    price: String(product.price),
    brand: product.brand,
    category: product.category,
    thumbnail: product.thumbnail,
    stock: String(product.stock),
    rating: String(product.rating),
  });
  const [status, setStatus] = useState("");

  async function handleUpdate(event) {
    event.preventDefault();
    setStatus("Saving changes...");

    const response = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
        rating: Number(form.rating || 0),
      }),
    });

    if (!response.ok) {
      setStatus(
        "Update failed. Make sure json-server is running on port 3001.",
      );
      return;
    }

    setStatus("Product updated successfully.");
  }

  return (
    <section>
      <p>
        <Link href="/products">Back to products</Link>
      </p>
      <div className="product-detail">
        <div className="image-frame">
          <Image
            src={form.thumbnail}
            alt={form.title}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
        <div className="edit-form">
          <h1>{product.title}</h1>
          <p>Product ID: {product.id}</p>
          <p>
            This page is statically generated using getStaticPaths +
            getStaticProps.
          </p>

          <form onSubmit={handleUpdate}>
            <div className="edit-grid">
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((f) => ({ ...f, title: event.target.value }))
                }
                placeholder="Title"
                required
              />
              <input
                value={form.thumbnail}
                onChange={(event) =>
                  setForm((f) => ({ ...f, thumbnail: event.target.value }))
                }
                placeholder="Thumbnail URL"
                required
              />
              <input
                value={form.brand}
                onChange={(event) =>
                  setForm((f) => ({ ...f, brand: event.target.value }))
                }
                placeholder="Brand"
                required
              />
              <input
                value={form.category}
                onChange={(event) =>
                  setForm((f) => ({ ...f, category: event.target.value }))
                }
                placeholder="Category"
                required
              />
              <input
                value={form.price}
                onChange={(event) =>
                  setForm((f) => ({ ...f, price: event.target.value }))
                }
                placeholder="Price"
                type="number"
                min="0"
                required
              />
              <input
                value={form.stock}
                onChange={(event) =>
                  setForm((f) => ({ ...f, stock: event.target.value }))
                }
                placeholder="Stock"
                type="number"
                min="0"
                required
              />
              <input
                value={form.rating}
                onChange={(event) =>
                  setForm((f) => ({ ...f, rating: event.target.value }))
                }
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
                onChange={(event) =>
                  setForm((f) => ({ ...f, description: event.target.value }))
                }
                placeholder="Description"
                rows={4}
                required
              />
            </div>
            <button className="btn primary" type="submit">
              Save Changes
            </button>
          </form>

          {status ? <p>{status}</p> : null}
        </div>
      </div>
    </section>
  );
}

export async function getStaticPaths() {
  const products = await getProducts();

  return {
    paths: products.slice(0, 20).map((product) => ({
      params: { id: String(product.id) },
    })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  try {
    const product = await getProductById(params.id);
    return {
      props: { product },
      revalidate: 60,
    };
  } catch {
    return { notFound: true };
  }
}
