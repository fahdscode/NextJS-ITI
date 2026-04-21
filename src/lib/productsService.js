const DUMMY_BASE_URL = "https://dummyjson.com";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";

function normalizeProduct(product) {
  return {
    id: Number(product.productId ?? product.id),
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
    const error = new Error(
      data?.message || `Request failed (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

async function seedIfEmpty() {
  const count = await Product.countDocuments();
  if (count > 0) {
    return;
  }

  const fallback = await requestJson(`${DUMMY_BASE_URL}/products?limit=30`, {
    cache: "no-store",
  });

  const seedDocs = (fallback.products || []).map((product) => ({
    productId: Number(product.id),
    title: product.title,
    description: product.description,
    price: Number(product.price ?? 0),
    brand: product.brand || "Unknown",
    category: product.category || "misc",
    thumbnail: product.thumbnail || "",
    stock: Number(product.stock ?? 0),
    rating: Number(product.rating ?? 0),
  }));

  if (seedDocs.length) {
    await Product.insertMany(seedDocs, { ordered: false });
  }
}

export async function getProducts(filters = {}) {
  try {
    await connectDB();
    await seedIfEmpty();

    const query = {};
    if (filters.brand) query.brand = filters.brand;
    if (filters.category) query.category = filters.category;

    const data = await Product.find(query).sort({ productId: 1 }).lean();
    return data.map(normalizeProduct);
  } catch (error) {
    const canFallback =
      error?.message?.includes("MONGODB_URI") ||
      error?.name === "MongooseServerSelectionError";
    if (!canFallback) {
      throw error;
    }

    const params = new URLSearchParams({ limit: "100" });
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.category) params.set("category", filters.category);

    const fallback = await requestJson(
      `${DUMMY_BASE_URL}/products?${params.toString()}`,
      {
        cache: "no-store",
      },
    );
    return (fallback.products || []).map(normalizeProduct);
  }
}

export async function getProductById(id) {
  try {
    await connectDB();
    await seedIfEmpty();

    const product = await Product.findOne({ productId: Number(id) }).lean();
    if (!product) {
      const notFound = new Error("Product not found");
      notFound.status = 404;
      throw notFound;
    }

    return normalizeProduct(product);
  } catch (error) {
    const canFallback =
      error?.message?.includes("MONGODB_URI") ||
      error?.name === "MongooseServerSelectionError";
    if (!canFallback) {
      throw error;
    }

    const product = await requestJson(`${DUMMY_BASE_URL}/products/${id}`, {
      cache: "no-store",
    });
    return normalizeProduct(product);
  }
}

export async function createProduct(payload) {
  await connectDB();

  const last = await Product.findOne().sort({ productId: -1 }).lean();
  const nextProductId = last ? last.productId + 1 : 1;

  const created = await Product.create({
    productId: nextProductId,
    title: payload.title,
    description: payload.description,
    price: Number(payload.price ?? 0),
    brand: payload.brand || "Unknown",
    category: payload.category || "misc",
    thumbnail: payload.thumbnail || "",
    stock: Number(payload.stock ?? 0),
    rating: Number(payload.rating ?? 0),
  });

  return normalizeProduct(created.toObject());
}

export async function updateProduct(id, payload) {
  await connectDB();

  const updated = await Product.findOneAndUpdate(
    { productId: Number(id) },
    {
      $set: {
        title: payload.title,
        description: payload.description,
        price: Number(payload.price ?? 0),
        brand: payload.brand || "Unknown",
        category: payload.category || "misc",
        thumbnail: payload.thumbnail || "",
        stock: Number(payload.stock ?? 0),
        rating: Number(payload.rating ?? 0),
      },
    },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) {
    const notFound = new Error("Product not found");
    notFound.status = 404;
    throw notFound;
  }

  return normalizeProduct(updated);
}

export async function buyProducts(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    const badRequest = new Error("At least one item is required");
    badRequest.status = 400;
    throw badRequest;
  }

  await connectDB();

  const normalizedItems = items.map((item) => ({
    id: Number(item.id),
    quantity: Math.max(1, Number(item.quantity || 1)),
  }));

  const products = await Product.find({
    productId: { $in: normalizedItems.map((item) => item.id) },
  });

  const itemsMap = new Map(
    products.map((product) => [product.productId, product]),
  );
  const orderItems = [];

  for (const item of normalizedItems) {
    const product = itemsMap.get(item.id);
    if (!product) {
      const notFound = new Error(`Product ${item.id} not found`);
      notFound.status = 404;
      throw notFound;
    }

    if (product.stock < item.quantity) {
      const stockError = new Error(`Insufficient stock for ${product.title}`);
      stockError.status = 400;
      throw stockError;
    }

    product.stock -= item.quantity;
    await product.save();

    orderItems.push({
      productId: product.productId,
      title: product.title,
      quantity: item.quantity,
      unitPrice: product.price,
      subTotal: Number((product.price * item.quantity).toFixed(2)),
    });
  }

  const totalPrice = Number(
    orderItems.reduce((sum, item) => sum + item.subTotal, 0).toFixed(2),
  );

  const order = await Order.create({
    items: orderItems,
    totalPrice,
  });

  return {
    orderId: String(order._id),
    totalPrice,
    items: orderItems,
  };
}

export async function deleteProduct(id) {
  await connectDB();

  const deleted = await Product.findOneAndDelete({
    productId: Number(id),
  }).lean();
  if (!deleted) {
    const notFound = new Error("Product not found");
    notFound.status = 404;
    throw notFound;
  }

  return { ok: true };
}
