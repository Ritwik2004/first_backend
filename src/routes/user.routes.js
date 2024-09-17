import {Router} from "express";
import {registerUser} from "../controllers/user.controler.js";
import {upload} from "../middlewires/multer.middlewire.js"
const router=Router();
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name: "coverimg",
            maxCount: 1
        }
    ]),
    registerUser
);

export default router;