import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { addQues,syncLeetCodeQidSlug,getAllQuestions,getQuestionById,updateQuestion,deleteQuestion,addBulkQuestions} from "../controller/question.controller.js";
import { get } from "mongoose";

const router = Router();

//Verified Routes
router.route("/getAll").get(verifyJWT, getAllQuestions);
router.route("/:Qid").get(verifyJWT, getQuestionById);

//Admin Routes
router.route("/syncSlug").post(verifyJWT, verifyAdmin, syncLeetCodeQidSlug);
router.route("/add").post(verifyJWT, verifyAdmin, addQues);
router.route("/update").get(verifyJWT, verifyAdmin, updateQuestion);
router.route("/:Qid").delete(verifyJWT, verifyAdmin, deleteQuestion);
router.route("/bulk").post(verifyJWT, verifyAdmin, addBulkQuestions);

export default router;