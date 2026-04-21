import { deleteProduct, getProductById, updateProduct } from "@/lib/productsService";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const product = await getProductById(id);
      return res.status(200).json(product);
    }

    if (req.method === "PUT") {
      const updated = await updateProduct(id, req.body);
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await deleteProduct(id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
}
