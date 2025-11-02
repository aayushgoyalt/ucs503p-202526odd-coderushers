import { Router } from "express";
import { AddContest,trialScrape,getActiveContests, makeArchive } from "../controller/contest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {verifyAdmin} from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/trial").get(verifyJWT,verifyAdmin, trialScrape);
router.route("/add").get(verifyJWT, verifyAdmin, AddContest);
router.route("/active").get(verifyJWT,getActiveContests);
router.route("/archive").post(verifyJWT,verifyAdmin,makeArchive);


export default router;