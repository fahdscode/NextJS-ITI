const JSON_SERVER_URL = process.env.JSON_SERVER_URL || "http://localhost:3001";
const DUMMY_BASE_URL = "https://dummyjson.com";

function normalizeProduct(product) {
  return {
    id: Number(product.id),
    title: product.title || "Untitled",
    description: product.description || "",
    price: Number(product.price ?? 0),
    brand: product.brand || "Unknown",
    category: product.category || "misc",
    thumbnail: product.thumbnail || "",
    stock: Number(product.stock ?? 0),
    rating: Number(product.rating ?? 0),
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.text();
  const data = body ? JSON.parse(body) : null;

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
}

function toJsonServerQuery(filters = {}) {
  const params = new URLSearchParams();
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.category) params.set("category", filters.category);
  return params.toString();
}

export async function getProducts(filters = {}) {
  const query = toJsonServerQuery(filters);
  const jsonServerUrl = `${JSON_SERVER_URL}/products${query ? `?${query}` : ""}`;

  try {
    const data = await requestJson(jsonServerUrl, { cache: "no-store" });
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  } catch {
    const params = new URLSearchParams({ limit: "100" });
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.category) params.set("category", filters.category);

    const fallback = await requestJson(`${DUMMY_BASE_URL}/products?${params.toString()}`, {
      cache: "no-store",
    });
    return (fallback.products || []).map(normalizeProduct);
  }
}

export async function getProductById(id) {
  try {
    const product = await requestJson(`${JSON_SERVER_URL}/products/${id}`, {
      cache: "no-store",
    });
    return normalizeProduct(product);
  } catch {
    const product = await requestJson(`${DUMMY_BASE_URL}/products/${id}`, {
      cache: "no-store",
    });
    return normalizeProduct(product);
  }
}

export async function createProduct(payload) {
  const product = await requestJson(`${JSON_SERVER_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return normalizeProduct(product);
}

export async function updateProduct(id, payload) {
  const product = await requestJson(`${JSON_SERVER_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return normalizeProduct(product);
}

export async function deleteProduct(id) {
  await requestJson(`${JSON_SERVER_URL}/products/${id}`, {
    method: "DELETE",
  });
  return { ok: true };
}
