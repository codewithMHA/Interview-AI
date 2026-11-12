export interface SavedChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  keyPoints?: string[];
  codeSnippet?: {
    language: string;
    code: string;
    explanation?: string;
  } | null;
  interviewTip?: string;
  suggestedFollowUps?: string[];
}

export interface SavedMentorSession {
  id: string;
  title: string;
  topic: string;
  updatedAt: string;
  messages: SavedChatMessage[];
}

const HISTORY_STORAGE_KEY = 'interviewai_mentor_sessions_v1';
const MIGRATED_FLAG_KEY = 'interviewai_mentor_migrated_v1';
const LEGACY_KEYS = ['interviewai_fullscreen_chat', 'interviewai_chat_messages'];

const buildSessionTitle = (messages: SavedChatMessage[], fallback = 'Placement Doubt Session') => {
  const firstUser = messages.find((m) => m.sender === 'user' && m.text.trim());
  if (!firstUser) return fallback;
  const clean = firstUser.text.trim().replace(/\s+/g, ' ');
  return clean.length > 52 ? `${clean.slice(0, 52)}...` : clean;
};

export const loadSavedMentorSessions = (): SavedMentorSession[] => {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    let sessions: SavedMentorSession[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(sessions)) sessions = [];

    // Migrate any pre-existing single flat chat history once so nothing gets lost
    if (!localStorage.getItem(MIGRATED_FLAG_KEY)) {
      const archived: SavedMentorSession[] = [...sessions];
      LEGACY_KEYS.forEach((key, idx) => {
        try {
          const legacyRaw = localStorage.getItem(key);
          if (!legacyRaw) return;
          const legacyMsgs: SavedChatMessage[] = JSON.parse(legacyRaw);
          if (Array.isArray(legacyMsgs) && legacyMsgs.some((m) => m.sender === 'user')) {
            const legacyId = `conv_saved_${idx}_${Date.now()}`;
            archived.push({
              id: legacyId,
              title: buildSessionTitle(legacyMsgs, 'Previous Chat History'),
              topic: 'General',
              updatedAt: new Date().toISOString(),
              messages: legacyMsgs,
            });
          }
        } catch {
          // ignore malformed legacy entry
        }
      });

      if (archived.length > sessions.length) {
        sessions = archived;
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sessions.slice(0, 30)));
      }
      localStorage.setItem(MIGRATED_FLAG_KEY, '1');
    }

    return sessions.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
};

export const saveMentorSession = ({
  id,
  topic,
  messages,
}: {
  id: string;
  topic: string;
  messages: SavedChatMessage[];
}): SavedMentorSession[] => {
  const hasUserTurn = messages.some((m) => m.sender === 'user' && m.text.trim());
  if (!hasUserTurn) {
    return loadSavedMentorSessions();
  }

  const existing = loadSavedMentorSessions();
  const nextEntry: SavedMentorSession = {
    id,
    title: buildSessionTitle(messages),
    topic: topic || 'General',
    updatedAt: new Date().toISOString(),
    messages: messages.slice(-40),
  };

  const filtered = existing.filter((s) => s.id !== id);
  const updated = [nextEntry, ...filtered].slice(0, 30);
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore quota errors
  }
  return updated;
};

export const deleteSavedMentorSession = (id: string): SavedMentorSession[] => {
  const updated = loadSavedMentorSessions().filter((s) => s.id !== id);
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
};

