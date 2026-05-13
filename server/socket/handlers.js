const Message = require("../models/Message");
const User = require("../models/User");

// Track online users: Map<userId, socketId>
const onlineUsers = new Map();

async function handleSocketEvents(io, socket) {
  const userId = socket.user.id;
  const username = socket.user.username || "Unknown";

  console.log(`🟢 ${username} connected (${socket.id})`);

  // Mark user online
  onlineUsers.set(userId, socket.id);
  await User.findByIdAndUpdate(userId, { isOnline: true });

  // Broadcast updated online list to everyone
  io.emit("users:online", Array.from(onlineUsers.keys()));

  // Join personal room for DMs
  socket.join(userId);

  // ── Global chat ───────────────────────────────────────────
  socket.on("message:global", async (data) => {
    try {
      const { content } = data;
      if (!content?.trim()) return;

      const message = await Message.create({
        sender: userId,
        roomId: "global",
        content: content.trim(),
      });

      const populated = await message.populate("sender", "username avatar");
      io.emit("message:global", populated);
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  // ── Direct messages ───────────────────────────────────────
  socket.on("message:dm", async (data) => {
    try {
      const { receiverId, content } = data;
      if (!content?.trim() || !receiverId) return;

      const roomId = [userId, receiverId].sort().join("-");

      const message = await Message.create({
        sender: userId,
        receiver: receiverId,
        roomId,
        content: content.trim(),
      });

      const populated = await message.populate("sender", "username avatar");

      // Send to sender and receiver rooms
      io.to(userId).emit("message:dm", populated);
      io.to(receiverId).emit("message:dm", populated);
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  // ── Typing indicators ─────────────────────────────────────
  socket.on("typing:start", ({ roomId, receiverId }) => {
    const payload = { userId, username, roomId };
    if (receiverId) {
      socket.to(receiverId).emit("typing:start", payload);
    } else {
      socket.broadcast.emit("typing:start", payload);
    }
  });

  socket.on("typing:stop", ({ roomId, receiverId }) => {
    const payload = { userId, roomId };
    if (receiverId) {
      socket.to(receiverId).emit("typing:stop", payload);
    } else {
      socket.broadcast.emit("typing:stop", payload);
    }
  });

  // ── Disconnect ────────────────────────────────────────────
  socket.on("disconnect", async () => {
    console.log(`🔴 ${username} disconnected`);
    onlineUsers.delete(userId);
    await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
    io.emit("users:online", Array.from(onlineUsers.keys()));
  });
}

module.exports = { handleSocketEvents };
