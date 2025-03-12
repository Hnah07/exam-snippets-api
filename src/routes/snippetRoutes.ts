import express from "express";
import {
  createSnippet,
  getSnippets,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
  getDashboard,
} from "../controllers/snippetController";

const router = express.Router();

router
  .get("/dashboard", getDashboard)
  .post("/", createSnippet)
  .get("/", getSnippets)
  .get("/:id", getSnippetById)
  .put("/:id", updateSnippet)
  .delete("/:id", deleteSnippet);

export default router;
