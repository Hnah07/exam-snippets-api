import express from "express";
import {
  createSnippet,
  getSnippets,
  getSnippetById,
  updateSnippet,
} from "../controllers/snippetController";

const router = express.Router();

router
  .post("/", createSnippet)
  .get("/", getSnippets)
  .get("/:id", getSnippetById)
  .put("/:id", updateSnippet);

export default router;
