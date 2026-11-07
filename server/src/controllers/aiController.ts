import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiService.js';
import { ConversationService } from '../services/conversationService.js';

export const analyzeCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { problemTitle, problemDescription, language, userCode } = req.body;

    if (!userCode || typeof userCode !== 'string' || userCode.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'User source code is required for AI complexity and quality analysis.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const analysis = await AIService.analyzeCode({
      problemTitle: problemTitle || 'Coding Practice Challenge',
      problemDescription,
      language: language || 'javascript',
      userCode,
    });

    res.status(200).json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const explainCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { problemTitle, language, userCode } = req.body;

    if (!userCode || typeof userCode !== 'string' || userCode.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'User source code is required to generate an explanation.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const explanation = await AIService.explainCode({
      problemTitle: problemTitle || 'Algorithm Solution',
      language: language || 'javascript',
      userCode,
    });

    res.status(200).json({
      success: true,
      data: explanation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const explainConcept = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { topic, focusArea, description, role } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Topic name is required to explain concept.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const explanation = await AIService.explainConcept({
      topic,
      focusArea,
      description,
      role,
    });

    res.status(200).json({
      success: true,
      data: explanation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const solveDoubt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { doubt, message, history, topic, role, conversationId } = req.body;
    const query = (doubt || message || '').trim();

    if (!query || query.length === 0) {
      res.status(400).json({
        success: false,
        error: 'A question or message is required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const userId = (req as any).user?.id || req.body.userId || 'guest';

    const response = await AIService.solveDoubt({
      doubt: query,
      conversationId,
      userId,
      history: Array.isArray(history) ? history : [],
      topic,
      role,
    });

    res.status(200).json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const chatWithMentor = solveDoubt;

export const listConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req.query.userId as string) || 'guest';
    const conversations = await ConversationService.listConversations(userId);
    res.status(200).json({
      success: true,
      data: conversations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await ConversationService.getConversationWithMessages(id);
    if (!result) {
      res.status(404).json({
        success: false,
        error: 'Conversation not found',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id || req.body.userId || 'guest';
    const { title, topic } = req.body;
    const conv = await ConversationService.getOrCreateConversation(
      userId,
      undefined,
      topic || 'General'
    );
    res.status(201).json({
      success: true,
      data: conv,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await ConversationService.deleteConversation(id);
    res.status(200).json({
      success: true,
      data: { deleted },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

