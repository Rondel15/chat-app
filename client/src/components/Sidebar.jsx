import { useEffect, useState } from "react";
import useChatStore from "../store/chatStore";
import useAuthStore from "../store/authStore";
import api from "../lib/api";

function Avatar({ username, size = "md" }) {
  const s = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  const colors = ["bg-purple-600","bg-blue-600","bg-pink-600","bg-teal-600","bg-orange-600"];
  const color = colors[username?.charCodeAt(0) % colors.length] || "bg-gray-600";
  return (
    <div className={`${s} ${color} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0`}>
      {username?.[0]?.toUpperCase()}
    </div>
  );
}

export default function Sidebar() {
  const [users, setUsers] = useState([]);
  const { activeRoom, setActiveRoom, onlineUsers } = useChatStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    api.get("/users").then(({ data }) => setUsers(data));
  }, [onlineUsers]);

  return (
    <aside className="w-64 flex flex-col bg-panel border-r border-border">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <h2 className="text-white font-semibold tracking-tight">ChatApp</h2>
        <p className="text-xs text-muted mt-0.5">@{user?.username}</p>
      </div>

      {/* Global room */}
      <div className="px-3 pt-4">
        <p className="text-xs text-muted uppercase tracking-wider px-2 mb-2">Rooms</p>
        <button
          onClick={() => setActiveRoom("global", null)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeRoom === "global"
              ? "bg-accent/20 text-accent"
              : "text-[#c0c0d0] hover:bg-white/5"
          }`}
        >
          <span className="text-lg">#</span>
          <span>Global</span>
        </button>
      </div>

      {/* Users list */}
      <div className="px-3 pt-5 flex-1 overflow-y-auto">
        <p className="text-xs text-muted uppercase tracking-wider px-2 mb-2">Direct Messages</p>
        <div className="space-y-0.5">
          {users.map((u) => {
            const isOnline = onlineUsers.includes(u._id);
            const isActive = activeRoom === u._id;
            return (
              <button
                key={u._id}
                onClick={() => setActiveRoom(u._id, u)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-accent/20 text-accent" : "text-[#c0c0d0] hover:bg-white/5"
                }`}
              >
                <div className="relative">
                  <Avatar username={u.username} size="sm" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-panel ${
                      isOnline ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                </div>
                <span className="truncate">{u.username}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-3">
        <Avatar username={user?.username} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium truncate">{user?.username}</p>
          <p className="text-xs text-green-500">Online</p>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="text-muted hover:text-white transition-colors text-xs"
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}
