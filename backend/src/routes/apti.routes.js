import { Router } from "express";
import { uploadBulkQuestions } from "../controller/apti.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();





//Secured Routes

//Admin Routes
router.route("/upload-bulk-questions").post(verifyJWT, verifyAdmin, uploadBulkQuestions);









export default router;