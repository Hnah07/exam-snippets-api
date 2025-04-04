import { Snippet } from "../models/snippetModel";
import { Request, Response } from "express";
import {
  buildSnippetQuery,
  calculatePagination,
  buildSortObject,
  isExpired,
} from "../utils/helpers";
import { CreateSnippetRequest } from "../types/snippet";

export const createSnippet = async (
  req: CreateSnippetRequest,
  res: Response
) => {
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
    } = req.query;

    const query = buildSnippetQuery(language?.toString(), tags?.toString());
    const { pageNum, limitNum, skip } = calculatePagination(
      page?.toString(),
      limit?.toString()
    );
    const sortOptions = buildSortObject(sort?.toString(), order?.toString());

    const [snippets, total] = await Promise.all([
      Snippet.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Snippet.countDocuments(query),
    ]);

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
    res.status(500).json({
      success: false,
      message: "Error fetching snippet",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateSnippet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, code, language, tags, expiresIn } = req.body;

    const currentSnippet = await Snippet.findById(id);

    if (!currentSnippet) {
      return res.status(404).json({
        success: false,
        message: "Snippet not found",
      });
    }

    const currentVersion =
      currentSnippet.history?.length > 0
        ? Math.max(...currentSnippet.history.map((h) => h.version))
        : 0;
    const newVersion = currentVersion + 1;

    const newHistoryEntry = {
      title,
      code,
      language,
      tags,
      version: newVersion,
      createdAt: new Date(),
    };

    const snippet = await Snippet.findByIdAndUpdate(
      id,
      {
        title,
        code,
        language,
        tags,
        expiresIn,
        $push: { history: newHistoryEntry },
      },
      { new: true }
    );

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: "Snippet not found",
      });
    }

    res.status(200).json({
      success: true,
      data: snippet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating snippet",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteSnippet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Snippet.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Snippet deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting snippet",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const { language, tag } = req.query;

    const query: any = {};
    if (language) query.language = language;
    if (tag) query.tags = tag;

    const snippets = await Snippet.find(query).sort({ createdAt: -1 }).lean();

    res.render("dashboard", {
      snippets,
      selectedLanguage: language?.toString() || "",
      selectedTag: tag?.toString() || "",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
