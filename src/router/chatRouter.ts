import ChatController from "@/controller/ChatController";
import ChatService from "@/service/ChatService";
import { Router } from "express";

const router = Router();

const chatController = new ChatController(new ChatService());

router.get("/get-user-rooms", chatController.getUserRooms);

export default router;
