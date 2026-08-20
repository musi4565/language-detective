import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { getPracticeSet, submitAnswer, practiceHistory } from "../controllers/practice.controller.js";
import { idParamSchema, practiceSubmitSchema } from "../validators/general.validators.js";

const router = Router();

router.get("/", authRequired, getPracticeSet);
router.get("/history", authRequired, practiceHistory);
router.post("/:id/submit", authRequired, validate(practiceSubmitSchema), submitAnswer);

export default router;