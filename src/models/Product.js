import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    brand: { type: String, default: "Unknown", index: true },
    category: { type: String, default: "misc", index: true },
    thumbnail: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true },
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
