import { Router } from "express";
import { verifyExtension,createOA ,getOAstatus,deleteOA,validateSubmission} from "../controller/OA.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {verifyAdmin} from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/test").post(verifyExtension);
router.route("/create").post(verifyJWT, createOA);
router.route("/status").get(verifyJWT, getOAstatus);
router.route("/submit").post(validateSubmission);
router.route("/delete").delete(verifyJWT, deleteOA);

export default router;