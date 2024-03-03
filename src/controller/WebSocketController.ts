import ChatService from "@/service/ChatService";
import Room from "@/types/Room";
import { v4 as uuid } from "uuid";
import { Server } from "ws";

class WebSocketController {
  private webSocketServer: Server;
  private chatService: ChatService;
  private matchingQueue = [];
  private clients = [];

  constructor(webSocketServer: Server, chatService: ChatService) {
    this.webSocketServer = webSocketServer;
    this.chatService = chatService;
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.wait = this.wait.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.send = this.send.bind(this);

    this.webSocketServer.on("connection", (ws) => {
      this.onMessage(ws);
      this.onClose(ws);
    });
  }

  onMessage(ws) {
    ws.on("message", async (data) => {
      const _data = JSON.parse(data.toString());

      const ACTION_LOOKUP = {
        send_message: this.sendMessage,
        join_room: this.joinRoom,
        wait: this.wait,
        leave_room: this.leaveRoom,
      };

      if (ACTION_LOOKUP[_data.action]) {
        ACTION_LOOKUP[_data.action](ws, _data);
      } else {
        console.error(
          `${JSON.stringify(_data, null, 2)}\nNot match any type of action`
        );
      }
    });
  }

  private send(ws, data) {
    ws.send(JSON.stringify(data));
  }

  private broadcastToRoom(room: Room, data) {
    const clientsInTargetRoom = this.clients.filter((c) =>
      room.uids.includes(c.username)
    );

    clientsInTargetRoom.forEach(({ ws: client }) => {
      this.send(client, data);
    });
  }

  private async sendMessage(_ws, data) {
    const message = {
      id: data.payload.id,
      type: data.payload.type,
      uid: data.payload.uid,
      message: data.payload.message,
      date: data.payload.date,
      user: data.payload.user,
    };

    const room = await this.chatService.getRoom(data.payload.room.id);

    room.messages.push(message);
    await this.chatService.updateRoom(room);

    this.broadcastToRoom(room, {
      ...data,
      action: "receive_message",
    });
  }

  private async joinRoom(ws, data) {
    this.clients.push({ username: data.payload.username, ws });
    const roomId = data.payload.room.id;
    const room = await this.chatService.getRoom(roomId);

    this.send(ws, {
      action: "joined_room",
      payload: room,
    });
  }

  private async wait(ws, data) {
    this.clients.push({ username: data.payload.username, ws });

    const matchIdx = this.matchingQueue.findIndex(
      (item) => item.uids.length === 1
    );
    const isMatch = matchIdx > -1;

    if (isMatch) {
      const existRoom = await this.chatService.getRoomByGroup([
        ...this.matchingQueue[matchIdx].uids,
        data.payload.username,
      ]);

      if (existRoom) {
        this.matchingQueue[matchIdx] = null;
        this.matchingQueue = this.matchingQueue.filter((item) => item !== null);

        this.broadcastToRoom(existRoom, {
          action: "joined_room",
          payload: existRoom,
        });
      } else {
        this.matchingQueue[matchIdx].uids.push(data.payload.username);

        const newRoom: Room = this.matchingQueue.splice(matchIdx, 1)[0];

        this.broadcastToRoom(newRoom, {
          action: "joined_room",
          payload: newRoom,
        });

        await this.chatService.createRoom(newRoom);
      }
    } else {
      this.matchingQueue.push({
        id: uuid(),
        uids: [data.payload.username],
        messages: [],
      });
    }
  }

  private async leaveRoom(ws, data) {
    const idx = this.clients.findIndex(
      (client) => client.username === data.payload.username
    );

    this.clients.splice(idx, 1);

    this.send(ws, {
      action: "leaved_room",
    });

    ws.close();
  }

  private onClose(ws) {
    ws.on("close", () => {
      console.log("closed");
    });
  }
}

export default WebSocketController;
