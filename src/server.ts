import Env from "@/config";
import * as router from "@/router";
import bodyParser from "body-parser";
import chalk from "chalk";
import cors from "cors";
import express from "express";
import session from "express-session";
import "source-map-support/register";
import { v4 as uuid } from "uuid";
import SocketServer from "ws";
import ChatService from "./service/ChatService";

const app = express();

app.use(bodyParser.json());

app.use(
  session({
    secret: Env.SESSION_SECRET,
    cookie: {
      secure: false,
      maxAge: 60 * 1000,
      httpOnly: true,
    },
    rolling: true,
    saveUninitialized: true,
    resave: false,
  })
);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

router.use(app);

app.use((err, _req, res, _next) => {
  err && console.log(err);
  res.status(err.status || 500).send({
    code: err.message || "Internal Server Error",
  });
});

const server = app.listen(Env.PORT, () => {
  console.log(chalk.white.bold.italic(`\n=============================`));
  console.log(chalk.white.bold.italic(`LISTENING ON : ${Env.PORT}`));
  console.log(chalk.white.bold.italic(`=============================\n`));
});

const wss = new SocketServer.WebSocketServer({ server, path: "/ws" });

let matchingQueue = [];
const clients = [];
const chatService = new ChatService();

wss.on("connection", (ws) => {
  ws.on("message", async (data) => {
    const _data = JSON.parse(data.toString());
    switch (_data.action) {
      case "send_message":
        const message = {
          id: _data.payload.id,
          type: _data.payload.type,
          uid: _data.payload.uid,
          message: _data.payload.message,
          date: _data.payload.date,
          user: _data.payload.user,
        };
        const targetRoom = await chatService.getRoom(_data.payload.room.id);
        targetRoom.messages.push(message);
        await chatService.updateRoom(targetRoom);

        const clientsInTargetRoom = clients.filter((c) =>
          targetRoom.uids.includes(c.username)
        );

        clientsInTargetRoom.forEach(({ ws }) => {
          ws.send(
            JSON.stringify({
              ..._data,
              action: "receive_message",
            })
          );
        });
        break;

      case "join_room":
        console.log(matchingQueue);
        clients.push({ username: _data.payload.username, ws });
        const roomId = _data.payload.room.id;
        const room = await chatService.getRoom(roomId);

        ws.send(
          JSON.stringify({
            action: "joined_room",
            payload: room,
          })
        );
        break;

      case "wait":
        clients.push({ username: _data.payload.username, ws });

        const matchIdx = matchingQueue.findIndex(
          (item) => item.uids.length === 1
        );
        const isMatch = matchIdx > -1;

        if (isMatch) {
          const existRoom = await chatService.getRoomByGroup([
            ...matchingQueue[matchIdx].uids,
            _data.payload.username,
          ]);

          if (existRoom) {
            matchingQueue[matchIdx] = null;
            matchingQueue = matchingQueue.filter((item) => item !== null);
            const clientsInTargetRoom = clients.filter((c) =>
              existRoom.uids.includes(c.username)
            );
            clientsInTargetRoom.forEach(({ ws }) => {
              ws.send(
                JSON.stringify({
                  action: "joined_room",
                  payload: existRoom,
                })
              );
            });
          } else {
            matchingQueue[matchIdx].uids.push(_data.payload.username);

            const room: {
              id: string;
              uids: string[];
              messages: any[];
            } = matchingQueue.splice(matchIdx, 1)[0];

            const clientsInTargetRoom = clients.filter((c) =>
              room.uids.includes(c.username)
            );

            clientsInTargetRoom.forEach(({ ws }) => {
              ws.send(
                JSON.stringify({
                  action: "joined_room",
                  payload: room,
                })
              );
            });

            await chatService.createRoom(room);
          }
        } else {
          matchingQueue.push({
            id: uuid(),
            uids: [_data.payload.username],
            messages: [],
          });
        }

        break;

      case "leave_room":
        const idx = clients.findIndex(
          (client) => client.username === _data.payload.username
        );
        clients.splice(idx, 1);
        ws.send(
          JSON.stringify({
            action: "leaved_room",
          })
        );
        ws.close();
        break;
      default:
        console.log(
          `${JSON.stringify(_data, null, 2)}\nNot match any type of action`
        );
        break;
    }
  });
  ws.on("close", () => {
    console.log("closed");
  });
});
