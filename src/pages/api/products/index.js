import { createProduct, getProducts } from "@/lib/productsService";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const products = await getProducts({
        brand: req.query.brand,
        category: req.query.category,
      });
      return res.status(200).json(products);
    }

    if (req.method === "POST") {
      const created = await createProduct(req.body);
      return res.status(201).json(created);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
}
