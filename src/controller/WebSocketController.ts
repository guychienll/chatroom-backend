import IChatService from "@/interface/IChatService";
import { Room } from "@/types/Room";
import { v4 as uuid } from "uuid";
import { Server, WebSocket } from "ws";

enum MessageAction {
  SEND_MESSAGE = "send_message",
  JOIN_ROOM = "join_room",
  WAIT = "wait",
  LEAVE_ROOM = "leave_room",
}

type MessageTransferObj<T extends MessageAction> = {
  action: T;
  payload: MessagePayload[T];
};

type MessagePayload = {
  [MessageAction.SEND_MESSAGE]: {
    id: string;
    type: string;
    uid: string;
    message: string;
    date: string;
    user: string;
    room: Room;
  };
  [MessageAction.JOIN_ROOM]: {
    username: string;
    room: Room;
  };
  [MessageAction.WAIT]: {
    username: string;
  };
  [MessageAction.LEAVE_ROOM]: {
    username: string;
  };
};

type Client = {
  username: string;
  ws: WebSocket;
};

class WebSocketController {
  private webSocketServer: Server;
  private chatService: IChatService;
  private matchingQueue: Room[] = [];
  private clients: Client[] = [];

  constructor(webSocketServer: Server, chatService: IChatService) {
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

  onMessage(ws: WebSocket) {
    ws.on("message", async (data: string) => {
      const _data: MessageTransferObj<MessageAction> = JSON.parse(
        data.toString()
      );

      switch (_data.action) {
        case MessageAction.SEND_MESSAGE:
          this.sendMessage(
            ws,
            _data as MessageTransferObj<MessageAction.SEND_MESSAGE>
          );
          break;
        case MessageAction.JOIN_ROOM:
          this.joinRoom(
            ws,
            _data as MessageTransferObj<MessageAction.JOIN_ROOM>
          );
          break;
        case MessageAction.WAIT:
          this.wait(ws, _data as MessageTransferObj<MessageAction.WAIT>);
          break;
        case MessageAction.LEAVE_ROOM:
          this.leaveRoom(
            ws,
            _data as MessageTransferObj<MessageAction.LEAVE_ROOM>
          );
          break;
        default:
          console.error(
            `${JSON.stringify(_data, null, 2)}\nNot match any type of action`
          );
      }
    });
  }

  //TODO: add data type
  private send(ws: WebSocket, data: any) {
    ws.send(JSON.stringify(data));
  }

  //TODO: add data type
  private broadcastToRoom(room: Room, data: any) {
    const clientsInTargetRoom = this.clients.filter((c) =>
      room.uids.includes(c.username)
    );

    clientsInTargetRoom.forEach(({ ws: client }) => {
      this.send(client, data);
    });
  }

  private async sendMessage(
    _ws: WebSocket,
    data: MessageTransferObj<MessageAction.SEND_MESSAGE>
  ) {
    const message = {
      id: data.payload.id,
      type: data.payload.type,
      uid: data.payload.uid,
      message: data.payload.message,
      date: data.payload.date,
      user: data.payload.user,
    };

    const room = await this.chatService.getRoom(data.payload.room.id);

    if (!room) {
      // TODO: handle websocket error
      throw new Error("entity not found: room");
    }

    room.messages.push(message);
    await this.chatService.updateRoom(room);

    this.broadcastToRoom(room, {
      ...data,
      action: "receive_message",
    });
  }

  private async joinRoom(
    ws: WebSocket,
    data: MessageTransferObj<MessageAction.JOIN_ROOM>
  ) {
    this.clients.push({ username: data.payload.username, ws });
    const roomId = data.payload.room.id;
    const room = await this.chatService.getRoom(roomId);

    this.send(ws, {
      action: "joined_room",
      payload: room,
    });
  }

  private async wait(
    ws: WebSocket,
    data: MessageTransferObj<MessageAction.WAIT>
  ) {
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
        delete this.matchingQueue[matchIdx];
        this.matchingQueue = this.matchingQueue.filter((item) => !!item);

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

  private async leaveRoom(
    ws: WebSocket,
    data: MessageTransferObj<MessageAction.LEAVE_ROOM>
  ) {
    const idx = this.clients.findIndex(
      (client) => client.username === data.payload.username
    );

    this.clients.splice(idx, 1);

    this.send(ws, {
      action: "leaved_room",
    });

    ws.close();
  }

  private onClose(ws: WebSocket) {
    ws.on("close", () => {
      const client = this.clients.find((client) => client.ws === ws);
      if (client) {
        this.matchingQueue = this.matchingQueue.filter(
          (item) => !item.uids.includes(client.username)
        );
      }
      this.clients = this.clients.filter((client) => client.ws !== ws);
      console.log("closed");
    });
  }
}

export default WebSocketController;
