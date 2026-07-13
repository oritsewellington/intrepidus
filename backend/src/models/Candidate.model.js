import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, default: "" },
    level: { type: String, default: "" },

    candidateNumber: { type: Number, required: true },
    candidateCode: { type: String, default: "" },

    photo: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    totalVotes: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true },
);

candidateSchema.index({ event: 1, candidateNumber: 1 }, { unique: true });

// Auto-generate candidateCode before save
candidateSchema.pre("save", function (next) {
  if (!this.candidateCode) {
    this.candidateCode =
      "INTREPIDUS-" + String(this.candidateNumber).padStart(4, "0");
  }
  next();
});

export default mongoose.model("Candidate", candidateSchema);
