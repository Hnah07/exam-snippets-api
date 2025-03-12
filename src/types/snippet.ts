import { Request } from "express";

export interface SnippetDocument {
  title: string;
  code: string;
  language: string;
  tags: string[];
  expiresIn?: number;
  _id: string;
}

export interface CreateSnippetRequest extends Request {
  body: {
    title: string;
    code: string;
    language: string;
    tags: string[];
    expiresIn?: number;
  };
}

export interface GetSnippetsQuery {
  language?: string;
  tags?: string;
  page?: string;
  limit?: string;
  sort?: string;
  order?: string;
}
