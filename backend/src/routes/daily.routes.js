import { Router } from "express";
import { getDailyQuestion } from "../controller/daily.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {verifyAdmin} from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/daily").get(verifyJWT,getDailyQuestion);

export default router;