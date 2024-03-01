import AuthController from "@/controller/AuthController";
import MailService from "@/service/MailService";
import UserService from "@/service/UserService";
import { Router } from "express";

const router = Router();

const authController = new AuthController(new UserService(), new MailService());

router.post("/generate-otp", authController.generateOtp);
router.post("/consume-otp", authController.consumeOtp);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/update-password", authController.updatePassword);

export default router;
