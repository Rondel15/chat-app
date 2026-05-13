import { useEffect } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";

export default function useSocket() {
  const token = useAuthStore((s) => s.token);
  const { addGlobalMessage, addDmMessage, setOnlineUsers, setTyping } = useChatStore();

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);

    socket.on("message:global", addGlobalMessage);
    socket.on("message:dm", addDmMessage);
    socket.on("users:online", setOnlineUsers);

    socket.on("typing:start", ({ userId, username, roomId }) =>
      setTyping(roomId, { userId, username }, true)
    );
    socket.on("typing:stop", ({ userId, roomId }) =>
      setTyping(roomId, { userId }, false)
    );

    return () => {
      socket.off("message:global");
      socket.off("message:dm");
      socket.off("users:online");
      socket.off("typing:start");
      socket.off("typing:stop");
      disconnectSocket();
    };
  }, [token]);

  return getSocket();
}
