import { Router } from "express";
import { syncDaily,syncLeetCodeQidSlug } from "../controller/ques.controller.js";


const router = Router();

router.route("/trial/:username").get(syncDaily);
router.route("/getAll").get(syncLeetCodeQidSlug);


export default router;