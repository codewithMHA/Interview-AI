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
    topic: string = 'General'
  ): Promise<{ id: string; title: string; summary?: string; topic: string }> {
    if (this.isDbConnected()) {
      if (conversationId && mongoose.isValidObjectId(conversationId)) {
        const existing = await Conversation.findById(conversationId);
        if (existing) {
          return {
            id: existing._id.toString(),
            title: existing.title,
            summary: existing.summary,
            topic: existing.topic || topic,
          };
        }
      }

      // Create new conversation in MongoDB
      const created = await Conversation.create({
        userId,
        title: 'New Conversation',
        topic,
        summary: '',
      });
      return {
        id: created._id.toString(),
        title: created.title,
        summary: created.summary,
        topic: created.topic || topic,
      };
    } else {
      // In-memory devStore
      if (conversationId) {
        const existing = devStore.getConversation(conversationId);
        if (existing) {
          return {
            id: existing._id,
            title: existing.title,
            summary: existing.summary,
            topic: existing.topic || topic,
          };
        }
      }
      const created = devStore.createConversation(userId, 'New Conversation', topic);
      return {
        id: created._id,
        title: created.title,
        summary: created.summary,
        topic: created.topic || topic,
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
    if (this.isDbConnected()) {
      const msg = await Message.create({
        conversationId,
        role,
        content,
        data: data || null,
      });

      // Update conversation metadata
      const updates: any = {
        $inc: { messageCount: 1 },
        updatedAt: new Date(),
      };
      if (role === 'user') {
        const conv = await Conversation.findById(conversationId);
        if (conv && (conv.title === 'New Conversation' || conv.title === 'New Chat')) {
          updates.title = content.substring(0, 40) + (content.length > 40 ? '...' : '');
        }
      }
      await Conversation.findByIdAndUpdate(conversationId, updates);

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
      const conv = await Conversation.findById(conversationId);
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

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
      return await Conversation.find({
        $or: [{ userId }, { userId: 'guest' }],
      })
        .sort({ updatedAt: -1 })
        .limit(30)
        .lean();
    } else {
      return devStore.getConversations(userId);
    }
  }

  /**
   * Gets a single conversation with its messages.
   */
  public static async getConversationWithMessages(
    conversationId: string
  ): Promise<{ conversation: any; messages: any[] } | null> {
    if (this.isDbConnected()) {
      const conversation = await Conversation.findById(conversationId).lean();
      if (!conversation) return null;
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .lean();
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
      await Message.deleteMany({ conversationId });
      const res = await Conversation.findByIdAndDelete(conversationId);
      return !!res;
    } else {
      return devStore.deleteConversation(conversationId);
    }
  }
}

