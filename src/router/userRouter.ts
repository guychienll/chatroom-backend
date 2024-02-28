import AuthController from "@/controller/AuthController";
import UserController from "@/controller/UserController";
import UserService from "@/service/UserService";
import { Router } from "express";

const router = Router();

const userController = new UserController(new UserService());

router.get("/profile", userController.profile);
router.get("/update", userController.update);

export default router;
