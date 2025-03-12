import { ParsedQs } from "qs";
import { FilterQuery, SortOrder } from "mongoose";
import { Snippet } from "../models/snippetModel";

type SnippetDocument = typeof Snippet;

interface SnippetQuery {
  language?: RegExp;
  tags?: { $in: RegExp[] };
  $or?: Array<{ expiresIn: { $exists: boolean } | { $gt: number } }>;
}

export const buildSnippetQuery = (
  language?: string | ParsedQs | string[] | ParsedQs[],
  tags?: string | ParsedQs | string[] | ParsedQs[]
): FilterQuery<SnippetDocument> => {
  const query: SnippetQuery = {};

  if (language && typeof language === "string") {
    query.language = new RegExp(language, "i");
  }

  if (tags && typeof tags === "string") {
    const tagArray = tags.split(",").map((tag) => new RegExp(tag.trim(), "i"));
    query.tags = { $in: tagArray };
  }

  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  query.$or = [
    { expiresIn: { $exists: false } },
    { expiresIn: { $gt: currentTimeInSeconds } },
  ];

  return query;
};

export const calculatePagination = (
  page: string | ParsedQs | string[] | ParsedQs[] = "1",
  limit: string | ParsedQs | string[] | ParsedQs[] = "10"
) => {
  const pageNum = parseInt(typeof page === "string" ? page : "1");
  const limitNum = parseInt(typeof limit === "string" ? limit : "10");
  const skip = (pageNum - 1) * limitNum;

  return {
    pageNum,
    limitNum,
    skip,
  };
};

export const buildSortObject = (
  sort: string | ParsedQs | string[] | ParsedQs[] = "createdAt",
  order: string | ParsedQs | string[] | ParsedQs[] = "desc"
): { [key: string]: SortOrder } => {
  const sortOrder: SortOrder = order === "desc" ? -1 : 1;
  return { [typeof sort === "string" ? sort : "createdAt"]: sortOrder };
};

export const isExpired = (expiresIn: number | null | undefined): boolean => {
  if (!expiresIn) return false;
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  return expiresIn <= currentTimeInSeconds;
};
