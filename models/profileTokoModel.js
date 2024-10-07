import mongoose from "mongoose";

const profileTokoSchema = new mongoose.Schema(
  {
    imgProfile: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    alamat: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("profileToko", profileTokoSchema);
