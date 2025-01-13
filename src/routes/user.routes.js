import {Router} from "express";
import {registerUser, loginUser, logoutUser, refreshAccessToken} from "../controllers/user.controler.js";
import {upload} from "../middlewires/multer.middlewire.js"
import { verifyJWT } from "../middlewires/auth.middlewire.js";

const router=Router();
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
// console.log("user routes is executed seccesfully...")
export default router;