import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { giveTopics,giveCompany } from "../controller/topic_company.controller.js";

const router = Router();

// Verified Routes
router.route("/topics/:topic").get(verifyJWT, giveTopics);
router.route("/companies/:company").get(verifyJWT, giveCompany);

export default router;