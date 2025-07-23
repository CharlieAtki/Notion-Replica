import express from 'express';
import {getWorkspaceTableData, updateOrCreateWorkspaceData} from "../controller/workspaceController.js";

const router = express.Router();

router.get('/fetchWorkspaceTableData', getWorkspaceTableData)
router.post('/updateOrCreateWorkspaceData', updateOrCreateWorkspaceData)

export default router;