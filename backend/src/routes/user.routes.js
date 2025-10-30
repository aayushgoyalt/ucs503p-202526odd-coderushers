import { Router } from "express";
import {Signup,Login,Logout,getCurrentUser,changePassword,syncLeetcode,getDSAstats} from "../controller/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/register").post(Signup)
router.route("/login").post(Login)


//Secured Routes
router.route("/logout").post(verifyJWT,Logout)
router.route("/me").get(verifyJWT,getCurrentUser)
router.route("/changePassword").post(verifyJWT,changePassword)
router.route("/syncLeetcode").post(verifyJWT,syncLeetcode)
router.route("/DSAstats").get(verifyJWT,getDSAstats)







export default router;