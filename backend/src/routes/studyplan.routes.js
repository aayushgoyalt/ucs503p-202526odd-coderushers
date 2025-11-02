import { Router } from "express";
import { postStudyPlan ,getStudyPlan_admin,patchStudyPlan_admin,deleteStudyPlan_admin,getStudyPlan_public} from "../controller/studyplan.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {verifyAdmin} from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/:userId").post(verifyJWT, verifyAdmin,postStudyPlan);
router.route("/:userId").get(verifyJWT, verifyAdmin,getStudyPlan_admin);
router.route("/:userId").patch(verifyJWT, verifyAdmin,patchStudyPlan_admin);
router.route("/:userId").delete(verifyJWT, verifyAdmin,deleteStudyPlan_admin);

router.route("/").get(verifyJWT, getStudyPlan_public);
export default router;

