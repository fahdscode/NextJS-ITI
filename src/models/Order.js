import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    items: { type: [OrderItemSchema], default: [] },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
