import SocketServer from "ws";
import WebSocketController from "@/controller/WebSocketController";
import ChatService from "@/service/ChatService";

const on = (server) => {
  new WebSocketController(
    new SocketServer.WebSocketServer({ server, path: "/ws" }),
    new ChatService()
  );
};

export { on };
