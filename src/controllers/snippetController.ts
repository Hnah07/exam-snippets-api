import { Snippet } from "../models/snippetModel";
import { Request, Response } from "express";
import {
  buildSnippetQuery,
  calculatePagination,
  buildSortObject,
  isExpired,
} from "../utils/helpers";

export const createSnippet = async (req: Request, res: Response) => {
  try {
    const { title, code, language, tags } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "Title, code, and language are required fields",
      });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one tag is required",
      });
    }

    const { expiresIn, ...snippetData } = req.body;
    const snippet = await Snippet.create({
      ...snippetData,
      ...(expiresIn !== undefined && { expiresIn }),
    });

    if (expiresIn !== undefined) {
      setTimeout(async () => {
        await Snippet.findByIdAndDelete(snippet._id);
      }, expiresIn * 1000);
    }

    res.status(201).json({
      success: true,
      data: snippet,
    });
  } catch (error) {
    console.error("Error creating snippet:", error);
    res.status(500).json({
      success: false,
      message: "Error creating snippet",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSnippets = async (req: Request, res: Response) => {
  try {
    const {
      language,
      tags,
      page = "1",
      limit = "10",
      sort = "createdAt",
      order = "desc",
    } = req.query as {
      language?: string;
      tags?: string;
      page?: string;
      limit?: string;
      sort?: string;
      order?: string;
    };

    const query = buildSnippetQuery(language, tags);
    const { pageNum, limitNum, skip } = calculatePagination(page, limit);
    const sortOptions = buildSortObject(sort, order);

    const snippets = await Snippet.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Snippet.countDocuments(query);

    res.status(200).json({
      success: true,
      data: snippets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching snippets",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSnippetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const snippet = await Snippet.findById(id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: "Snippet not found",
      });
    }

    if (isExpired(snippet.expiresIn)) {
      await Snippet.findByIdAndDelete(id);
      return res.status(404).json({
        success: false,
        message: "Snippet has expired",
      });
    }

    res.status(200).json({
      success: true,
      data: snippet,
    });
  } catch (error) {
    console.error("Error fetching snippet:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching snippet",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
