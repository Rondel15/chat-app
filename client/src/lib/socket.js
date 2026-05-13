import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5001";

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  socket = io(SERVER_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
