import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createSession, listSessions, getSession, deleteSession, sendMessage } from "../controllers/chat.controller.js";
import { chatSessionSchema, chatMessageSchema, idParamSchema } from "../validators/general.validators.js";

const router = Router();

router.get("/sessions", authRequired, listSessions);
router.post("/session", authRequired, validate(chatSessionSchema), createSession);
router.get("/session/:id", authRequired, validate(idParamSchema), getSession);
router.delete("/session/:id", authRequired, validate(idParamSchema), deleteSession);
router.post("/message", authRequired, validate(chatMessageSchema), sendMessage);

export default router;