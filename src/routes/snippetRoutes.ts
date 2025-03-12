import express, { RequestHandler } from 'express';
import { createSnippet, getSnippets } from '../controllers/snippetController';

const router = express.Router();

router.post('/', createSnippet as RequestHandler);
router.get('/', getSnippets as RequestHandler);

export default router; 