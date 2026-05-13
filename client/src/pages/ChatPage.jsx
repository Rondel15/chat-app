import { useEffect } from "react";
import useSocket from "../hooks/useSocket";
import useChatStore from "../store/chatStore";
import useAuthStore from "../store/authStore";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import api from "../lib/api";

export default function ChatPage() {
  useSocket(); // connect socket on mount
  const { activeRoom, setGlobalMessages, setDmMessages, activeUser } = useChatStore();

  // Load message history when switching rooms
  useEffect(() => {
    if (activeRoom === "global") {
      api.get("/messages/global").then(({ data }) => setGlobalMessages(data));
    } else {
      api.get(`/messages/dm/${activeRoom}`).then(({ data }) =>
        setDmMessages(activeRoom, data)
      );
    }
  }, [activeRoom]);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
