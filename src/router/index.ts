import authRouter from "@/router/authRouter";
import chatRouter from "@/router/chatRouter";
import fileRouter from "@/router/fileRouter";
import userRouter from "@/router/userRouter";
import * as webSocketRouter from "@/router/webSocketRouter";
import { Express } from "express-serve-static-core";
import { Server } from "http";

const use = (app: Express) => {
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/chat", chatRouter);
  app.use("/file", fileRouter);
};

const register = (server: Server) => {
  webSocketRouter.on(server);
};

export { use, register };
