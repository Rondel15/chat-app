import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  socket = io("http://localhost:5001", {
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
