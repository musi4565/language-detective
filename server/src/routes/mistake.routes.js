import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listMistakes, mistakeStats, getMistake, reviewMistake, dueMistakes } from "../controllers/mistake.controller.js";
import { listSchema, idParamSchema, reviewSchema } from "../validators/general.validators.js";

const router = Router();

router.get("/", authRequired, validate(listSchema), listMistakes);
router.get("/stats", authRequired, mistakeStats);
router.get("/due", authRequired, dueMistakes);
router.get("/:id", authRequired, validate(idParamSchema), getMistake);
router.post("/:id/review", authRequired, validate(reviewSchema), reviewMistake);

export default router;