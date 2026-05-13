import { useEffect, useRef, useState } from "react";
import useChatStore from "../store/chatStore";
import useAuthStore from "../store/authStore";
import { getSocket } from "../lib/socket";

function Avatar({ username }) {
  const colors = ["bg-purple-600","bg-blue-600","bg-pink-600","bg-teal-600","bg-orange-600"];
  const color = colors[username?.charCodeAt(0) % colors.length] || "bg-gray-600";
  return (
    <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0`}>
      {username?.[0]?.toUpperCase()}
    </div>
  );
}

function MessageBubble({ msg, isOwn }) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={`flex gap-3 msg-enter ${isOwn ? "flex-row-reverse" : ""}`}>
      {!isOwn && <Avatar username={msg.sender?.username} />}
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn && (
          <span className="text-xs text-muted mb-1">{msg.sender?.username}</span>
        )}
        <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
          isOwn
            ? "bg-accent text-white rounded-tr-sm"
            : "bg-panel border border-border text-[#e2e2f0] rounded-tl-sm"
        }`}>
          {msg.content}
        </div>
        <span className="text-[10px] text-muted mt-1">{time}</span>
      </div>
    </div>
  );
}

export default function ChatWindow() {
  const { activeRoom, activeUser, globalMessages, dmMessages, typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const typingRef = useRef(null);

  const messages = activeRoom === "global"
    ? globalMessages
    : (dmMessages[activeRoom] || []);

  const typing = typingUsers[activeRoom === "global" ? "global" : activeRoom] || [];
  const othersTyping = typing.filter((u) => u.userId !== user?._id);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const socket = getSocket();
    if (!socket || !input.trim()) return;

    if (activeRoom === "global") {
      socket.emit("message:global", { content: input });
    } else {
      socket.emit("message:dm", { receiverId: activeRoom, content: input });
    }

    // Stop typing indicator
    socket.emit("typing:stop", {
      roomId: activeRoom,
      receiverId: activeRoom !== "global" ? activeRoom : undefined,
    });

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (!socket) return;

    const payload = {
      roomId: activeRoom,
      receiverId: activeRoom !== "global" ? activeRoom : undefined,
    };

    socket.emit("typing:start", payload);
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => socket.emit("typing:stop", payload), 2000);
  };

  const roomTitle = activeRoom === "global" ? "# Global" : `@ ${activeUser?.username || ""}`;

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <h2 className="font-semibold text-white">{roomTitle}</h2>
        {activeRoom !== "global" && (
          <span className="text-xs text-muted">Direct message</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-muted text-sm text-center mt-16">
            No messages yet. Say hello 👋
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            msg={msg}
            isOwn={msg.sender?._id === user?._id}
          />
        ))}
        {othersTyping.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <div className="flex gap-0.5">
              {[0,1,2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span>{othersTyping.map(u => u.username).join(", ")} typing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex items-end gap-3 bg-panel border border-border rounded-xl px-4 py-3 focus-within:border-accent transition-colors">
          <textarea
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${roomTitle}…`}
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-muted resize-none focus:outline-none max-h-32"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="bg-accent hover:bg-accent-dim disabled:opacity-30 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-muted mt-1.5 ml-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
