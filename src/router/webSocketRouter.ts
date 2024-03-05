import SocketServer from "ws";
import WebSocketController from "@/controller/WebSocketController";
import ChatService from "@/service/ChatService";
import { Server } from "http";

const on = (server: Server) => {
  new WebSocketController(
    new SocketServer.WebSocketServer({ server, path: "/ws" }),
    new ChatService()
  );
};

export { on };
