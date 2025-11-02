import mongoose from "mongoose";
const claimSchema = new mongoose.Schema({
  type: { type: String, enum: ["url","text"], required: true },
  url: { type: String },
  text: { type: String },
  og: {
    title: String, description: String, image: String, siteName: String
  },
  status: {
    type: String,
    enum: ["unverified","under_review","verified_true","misleading","false"],
    default: "unverified"
  },
  tags: { type: [String], default: [] },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

claimSchema.index({ "og.title": "text", text: "text" });
claimSchema.index({ status: 1, createdAt: -1 });

export type ClaimDoc = mongoose.InferSchemaType<typeof claimSchema>;
export default mongoose.model("Claim", claimSchema);
