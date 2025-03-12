import { Request, Response } from 'express';
import { Snippet } from '../models/snippetModel';
import { SortOrder } from 'mongoose';

interface CreateSnippetRequest {
  title: string;
  code: string;
  language: string;
  tags: string[];
  expiresIn?: number;
}

interface GetSnippetsQuery {
  language?: string;
  tags?: string;
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const createSnippet = async (req: Request, res: Response) => {
  try {
    const { title, code, language, tags, expiresIn } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Title, code, and language are required fields'
      });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one tag is required'
      });
    }

    const snippet = await Snippet.create({
      title,
      code,
      language,
      tags,
      ...(expiresIn !== undefined && { expiresIn })
    });

    if (expiresIn !== undefined) {
      setTimeout(async () => {
        await Snippet.findByIdAndDelete(snippet._id);
      }, expiresIn * 1000);
    }

    res.status(201).json({
      success: true,
      data: snippet
    });
  } catch (error) {
    console.error('Error creating snippet:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating snippet',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSnippets = async (req: Request, res: Response) => {
  try {
    const language = req.query.language as string | undefined;
    const tags = req.query.tags as string | undefined;
    const page = (req.query.page as string) || '1';
    const limit = (req.query.limit as string) || '10';
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as 'asc' | 'desc') || 'desc';

    const query: any = {};
    
    if (language) {
      query.language = new RegExp(language, 'i');
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => new RegExp(tag.trim(), 'i'));
      query.tags = { $in: tagArray };
    }

    query.expiresIn = { $exists: false };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObject: { [key: string]: SortOrder } = { [sort]: sortOrder as SortOrder };

    const snippets = await Snippet.find(query)
      .sort(sortObject)
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
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching snippets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching snippets',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
