import Env from "@/config";
import db from "@/db";
import * as router from "@/router";
import bodyParser from "body-parser";
import chalk from "chalk";
import cors from "cors";
import express from "express";
import session from "express-session";
import "source-map-support/register";
import SocketServer from "ws";

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

wss.on("connection", (ws) => {
  ws.on("message", async (data) => {
    const _data = JSON.parse(data.toString());
    const { id } = _data.payload;
    switch (_data.action) {
      case "send_message":
        await db.collection("messages").doc(id).set(_data.payload);
        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              ..._data,
              action: "receive_message",
            })
          );
        });
        break;
      default:
        console.log(`${_data.type}, Not match any type of action`);
        break;
    }
  });
  ws.on("close", () => {
    console.log("closed");
  });
});
