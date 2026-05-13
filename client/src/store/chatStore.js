import { create } from "zustand";

const useChatStore = create((set, get) => ({
  activeRoom: "global",      // "global" or a userId string
  activeUser: null,          // User object for DM
  globalMessages: [],
  dmMessages: {},            // { [userId]: Message[] }
  onlineUsers: [],
  typingUsers: {},           // { [roomId]: [{ userId, username }] }

  setActiveRoom: (roomId, user = null) =>
    set({ activeRoom: roomId, activeUser: user }),

  setOnlineUsers: (ids) => set({ onlineUsers: ids }),

  addGlobalMessage: (msg) =>
    set((s) => ({ globalMessages: [...s.globalMessages, msg] })),

  setGlobalMessages: (msgs) => set({ globalMessages: msgs }),

  addDmMessage: (msg) => {
    const { user } = msg.sender;
    // determine the "other" user id
    return set((s) => {
      const key = msg.sender._id === s.activeRoom
        ? msg.sender._id
        : s.activeRoom;
      const prev = s.dmMessages[key] || [];
      return { dmMessages: { ...s.dmMessages, [key]: [...prev, msg] } };
    });
  },

  setDmMessages: (userId, msgs) =>
    set((s) => ({ dmMessages: { ...s.dmMessages, [userId]: msgs } })),

  setTyping: (roomId, user, isTyping) =>
    set((s) => {
      const current = s.typingUsers[roomId] || [];
      const filtered = current.filter((u) => u.userId !== user.userId);
      return {
        typingUsers: {
          ...s.typingUsers,
          [roomId]: isTyping ? [...filtered, user] : filtered,
        },
      };
    }),
}));

export default useChatStore;
