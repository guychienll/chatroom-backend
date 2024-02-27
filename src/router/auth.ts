import AuthController from "@/controller/AuthController";
import MailService from "@/service/MailService";
import UserService from "@/service/UserService";
import { Router } from "express";

const router = Router();

const auth = new AuthController(new UserService(), new MailService());

router.post("/send-validation-code", auth.sendValidationCode);
router.post("/validate-code", auth.validateCode);
router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/profile", auth.profile);

export default router;
