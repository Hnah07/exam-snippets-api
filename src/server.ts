// Imports
import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { notFound } from "./controllers/notFoundController";
import snippetRoutes from "./routes/snippetRoutes";
import mongoose from "mongoose";

// Variables
const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set("view engine", "ejs");
app.set("views", "src/views");
app.set("view cache", process.env.NODE_ENV === "production");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("src/public"));

// Routes
app.use("/snippets", snippetRoutes);
app.all("*", notFound);

// Database connection
try {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Database connection OK");
} catch (err) {
  console.error(err);
  process.exit(1);
}

// Server Listening
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}! 🚀`);
});
