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
      get: function (code: string) {
        return Buffer.from(code, "base64").toString("utf-8");
      },
      set: function (code: string) {
        return Buffer.from(code).toString("base64");
      },
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      required: true,
    },
    expiresIn: {
      type: Number,
      required: false,
    },
    history: [
      {
        title: String,
        code: String,
        language: String,
        tags: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        version: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

export const Snippet = mongoose.model("Snippet", snippetSchema);
