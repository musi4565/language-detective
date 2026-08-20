import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { analyzeTranscript, history, getById } from "../controllers/speaking.controller.js";
import { speakingAnalyzeSchema, idParamSchema } from "../validators/general.validators.js";

const router = Router();

router.post("/analyze", authRequired, validate(speakingAnalyzeSchema), analyzeTranscript);
router.get("/history", authRequired, history);
router.get("/:id", authRequired, validate(idParamSchema), getById);

export default router;