import mongoose from "mongoose";

const snippetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    expiresIn: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export const Snippet = mongoose.model("Snippet", snippetSchema); 