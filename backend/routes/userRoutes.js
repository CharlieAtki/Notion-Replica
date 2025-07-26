import express from "express";
import {authCheck} from "../controller/authCheck.js";
import {addUserToOrgAndSwitch, fetchCurrentUser, switchOrganisation, userLogout} from "../controller/userController.js";

const router = express.Router();

router.get('/authCheck', authCheck);
router.get('/fetchCurrentUser', fetchCurrentUser);
router.get('/logout', userLogout);

router.post('/addUserToOrgAndSwitch', addUserToOrgAndSwitch)
router.post('/switchOrg', switchOrganisation);

export default router;