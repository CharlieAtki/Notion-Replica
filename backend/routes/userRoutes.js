import express from "express";
import {authCheck} from "../controller/authCheck.js";
import {fetchCurrentUser, userLogout} from "../controller/userController.js";

const router = express.Router();

router.get('/authCheck', authCheck);
router.get('/fetchCurrentUser', fetchCurrentUser);
router.get('/logout', userLogout);

export default router;