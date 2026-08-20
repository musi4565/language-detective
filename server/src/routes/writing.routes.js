import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { analyze, history, getById } from "../controllers/writing.controller.js";
import { analyzeWritingSchema, listSchema, idParamSchema } from "../validators/general.validators.js";

const router = Router();

router.post("/analyze", authRequired, validate(analyzeWritingSchema), analyze);
router.get("/history", authRequired, validate(listSchema), history);
router.get("/:id", authRequired, validate(idParamSchema), getById);

export default router;