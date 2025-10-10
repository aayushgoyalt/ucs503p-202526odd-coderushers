import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { getAllQuestions,getQuestionById,giveTopics,giveCompany } from "../controller/dsa.controller.js";


const router = Router();
router.route("/getAll").get(verifyJWT, getAllQuestions);
router.route("/:Qid").get(verifyJWT, getQuestionById);
router.route("/topics/:topic").get(verifyJWT, giveTopics);
router.route("/companies/:company").get(verifyJWT, giveCompany);

export default router;