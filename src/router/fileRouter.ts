import FileController from "@/controller/FileController";
import { Router } from "express";

const router = Router();

const fileController = new FileController();

router.post("/upload", fileController.upload);

export default router;
