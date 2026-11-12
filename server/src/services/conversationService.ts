import mongoose from 'mongoose';
import { Conversation, IConversation } from '../models/Conversation.js';
import { Message, IMessage } from '../models/Message.js';
import { devStore, DevConversation, DevMessage } from './devStore.js';

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
  data?: any;
}

export class ConversationService {
  private static isDbConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Retrieves an existing conversation or creates a new one.
   */
  public static async getOrCreateConversation(
    userId: string = 'guest',
    conversationId?: string,
    topic: string = 'General',
    title: string = 'New Conversation'
  ): Promise<{ id: string; title: string; summary?: string; topic: string; isNew?: boolean }> {
    const resolvedTitle = (title && title.trim()) || 'New Conversation';
    if (this.isDbConnected()) {
      if (conversationId && mongoose.isValidObjectId(conversationId)) {
        const existing = await Conversation.findById(conversationId).lean();
        if (existing && String(existing.userId) === String(userId)) {
          return {
            id: existing._id.toString(),
            title: existing.title,
            summary: existing.summary,
            topic: existing.topic || topic,
            isNew: false,
          };
        }
      }

      // Create new conversation in MongoDB
      const created = await Conversation.create({
        userId,
        title: resolvedTitle,
        topic,
        summary: '',
      });
      return {
        id: created._id.toString(),
        title: created.title,
        summary: created.summary,
        topic: created.topic || topic,
        isNew: true,
      };
    } else {
      // In-memory devStore
      if (conversationId) {
        const existing = devStore.getConversation(conversationId);
        if (existing && String(existing.userId) === String(userId)) {
          return {
            id: existing._id,
            title: existing.title,
            summary: existing.summary,
            topic: existing.topic || topic,
            isNew: false,
          };
        }
      }
      const created = devStore.createConversation(userId, resolvedTitle, topic);
      return {
        id: created._id,
        title: created.title,
        summary: created.summary,
        topic: created.topic || topic,
        isNew: true,
      };
    }
  }

  /**
   * Appends a message to the conversation.
   */
  public static async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    data?: any
  ): Promise<{ id: string; createdAt: Date }> {
    if (this.isDbConnected() && mongoose.isValidObjectId(conversationId)) {
      const convUpdatePromise =
        role === 'user'
          ? Conversation.bulkWrite([
              {
                updateOne: {
                  filter: {
                    _id: conversationId,
                    title: { $in: ['New Conversation', 'New Chat'] },
                  },
                  update: {
                    $set: {
                      title: content.substring(0, 40) + (content.length > 40 ? '...' : ''),
                    },
                  },
                },
              },
              {
                updateOne: {
                  filter: { _id: conversationId },
                  update: {
                    $inc: { messageCount: 1 },
                    $set: { updatedAt: new Date() },
                  },
                },
              },
            ])
          : Conversation.findByIdAndUpdate(conversationId, {
              $inc: { messageCount: 1 },
              $set: { updatedAt: new Date() },
            });

      const [msg] = await Promise.all([
        Message.create({
          conversationId,
          role,
          content,
          data: data || null,
        }),
        convUpdatePromise,
      ]);

      return {
        id: msg._id.toString(),
        createdAt: msg.createdAt,
      };
    } else {
      const msg = devStore.addMessage(conversationId, role, content, data);
      return {
        id: msg._id,
        createdAt: msg.createdAt,
      };
    }
  }

  /**
   * Retrieves conversation history formatted for AI context.
   */
  public static async getHistoryForAI(
    conversationId: string,
    limit: number = 20
  ): Promise<{
    history: ChatHistoryItem[];
    summary?: string;
    topic?: string;
  }> {
    if (this.isDbConnected()) {
      if (!mongoose.isValidObjectId(conversationId)) {
        return { history: [] };
      }

      const [conv, messages] = await Promise.all([
        Conversation.findById(conversationId).lean(),
        Message.find({ conversationId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
      ]);

      // Return chronological order
      const chronological = messages.reverse().map((m) => ({
        role: m.role,
        content: m.content,
        data: m.data,
      }));

      return {
        history: chronological,
        summary: conv?.summary,
        topic: conv?.topic,
      };
    } else {
      const conv = devStore.getConversation(conversationId);
      const messages = devStore.getMessages(conversationId, limit);
      return {
        history: messages.map((m) => ({
          role: m.role,
          content: m.content,
          data: m.data,
        })),
        summary: conv?.summary,
        topic: conv?.topic,
      };
    }
  }

  /**
   * Lists all conversations for a user.
   */
  public static async listConversations(userId: string = 'guest'): Promise<any[]> {
    if (this.isDbConnected()) {
      return await Conversation.find({ userId: String(userId) })
        .sort({ updatedAt: -1 })
        .limit(30)
        .lean();
    } else {
      return devStore.getConversations(String(userId));
    }
  }

  /**
   * Gets a single conversation with its messages.
   */
  public static async getConversationWithMessages(
    conversationId: string
  ): Promise<{ conversation: any; messages: any[] } | null> {
    if (this.isDbConnected()) {
      if (!mongoose.isValidObjectId(conversationId)) {
        return null;
      }
      const [conversation, messages] = await Promise.all([
        Conversation.findById(conversationId).lean(),
        Message.find({ conversationId }).sort({ createdAt: 1 }).lean(),
      ]);
      if (!conversation) return null;
      return { conversation, messages };
    } else {
      const conversation = devStore.getConversation(conversationId);
      if (!conversation) return null;
      const messages = devStore.getMessages(conversationId, 100);
      return { conversation, messages };
    }
  }

  /**
   * Deletes a conversation and its messages.
   */
  public static async deleteConversation(conversationId: string): Promise<boolean> {
    if (this.isDbConnected()) {
      if (!mongoose.isValidObjectId(conversationId)) {
        return false;
      }
      const [, res] = await Promise.all([
        Message.deleteMany({ conversationId }),
        Conversation.findByIdAndDelete(conversationId),
      ]);
      return !!res;
    } else {
      return devStore.deleteConversation(conversationId);
    }
  }
}

