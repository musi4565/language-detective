import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { getTest, submitTest, history } from "../controllers/placement.controller.js";
import { placementSubmitSchema } from "../validators/general.validators.js";

const router = Router();

router.get("/test", authRequired, getTest);
router.post("/submit", authRequired, validate(placementSubmitSchema), submitTest);
router.get("/history", authRequired, history);

export default router;