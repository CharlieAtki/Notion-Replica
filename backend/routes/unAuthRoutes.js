import express from "express";
import {userCreation, userLogin} from "../controller/userController.js";
const router = express.Router();

router.post('/createUserAccount', userCreation)
router.post('/userLogin', userLogin)

export default router;