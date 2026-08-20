import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { dashboard, progress, weeklyActivity, skills } from "../controllers/progress.controller.js";
import { today, submit } from "../controllers/challenge.controller.js";
import { challengeSubmitSchema } from "../validators/general.validators.js";

const router = Router();

router.get("/dashboard", authRequired, dashboard);
router.get("/stats", authRequired, progress);
router.get("/weekly", authRequired, weeklyActivity);
router.get("/skills", authRequired, skills);
router.get("/challenge", authRequired, today);
router.post("/challenge/submit", authRequired, validate(challengeSubmitSchema), submit);

export default router;