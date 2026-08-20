import { Router } from "express";
import { register, login, me, updateProfile, changePassword, completeOnboarding } from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  completeOnboardingSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authRequired, me);
router.patch("/profile", authRequired, validate(updateProfileSchema), updateProfile);
router.post("/change-password", authRequired, validate(changePasswordSchema), changePassword);
router.post("/onboarding", authRequired, validate(completeOnboardingSchema), completeOnboarding);

export default router;