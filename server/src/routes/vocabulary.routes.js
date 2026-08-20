import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listVocabulary, addWord, deleteWord, reviewWord } from "../controllers/vocabulary.controller.js";
import { vocabularyAddSchema, idParamSchema, reviewSchema, listSchema } from "../validators/general.validators.js";

const router = Router();

router.get("/", authRequired, validate(listSchema), listVocabulary);
router.post("/", authRequired, validate(vocabularyAddSchema), addWord);
router.post("/:id/review", authRequired, validate(reviewSchema), reviewWord);
router.delete("/:id", authRequired, validate(idParamSchema), deleteWord);

export default router;