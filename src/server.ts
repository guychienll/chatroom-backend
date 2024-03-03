import Env from "@/config";
import * as router from "@/router";
import bodyParser from "body-parser";
import chalk from "chalk";
import cors from "cors";
import express from "express";
import session from "express-session";
import "source-map-support/register";
import SocketServer from "ws";
import WebSocketController from "./controller/WebSocketController";
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

router.register(server);
