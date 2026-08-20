import { Router } from "express";
import { authRequired, adminRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import {
  listUsers,
  toggleBlock,
  userStats,
  analytics,
  listMistakes,
  listLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "../controllers/admin.controller.js";

const router = Router();
router.use(authRequired, adminRequired);

const languageSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(10),
    name: z.string().min(1).max(100),
    flag: z.string().max(10).optional(),
  }),
});

const userListSchema = z.object({
  query: z.object({ page: z.string().optional(), limit: z.string().optional(), search: z.string().optional() }),
});

const idParam = z.object({
  params: z.object({ id: z.string().min(1) }),
});

router.get("/users", validate(userListSchema), listUsers);
router.get("/users/:id", validate(idParam), userStats);
router.post("/users/:id/block", validate(idParam), toggleBlock);
router.get("/analytics", analytics);
router.get("/mistakes", listMistakes);
router.get("/languages", listLanguages);
router.post("/languages", validate(languageSchema), createLanguage);
router.patch("/languages/:id", validate(idParam), validate(languageSchema.partial()), updateLanguage);
router.delete("/languages/:id", validate(idParam), deleteLanguage);

export default router;