import Workspace from "../models/Workspace.js";
import mongoose from "mongoose";

export const getWorkspaceTableData = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.currentOrgId) {
            return res.status(401).json({
                success: false,
                message: "User session or organization ID is missing.",
            });
        }

        const workspaces = await Workspace.find({
            orgId: req.session.user.currentOrgId,
        });

        if (!workspaces || workspaces.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Workspace data found for this organization.",
            });
        }

        // Assuming you want to fetch the first (or only) workspace's table data
        const workspaceTable = workspaces[0].page; // Access the 'page' object

        return res.status(200).json({
            success: true,
            columns: workspaceTable.columns, // Return columns directly
            rows: workspaceTable.rows,       // Return rows directly
        });

    } catch (error) {
        console.error("Error fetching workspace data:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching workspace data.",
            error: error.message,
        });
    }
};

export const updateOrCreateWorkspaceData = async (req, res) => {
    try {
        // 1. Validate incoming data and session information
        const { orgId, title, content, columns, rows } = req.body;

        // Ensure user is authenticated and session has user ID
        if (!req.session.user || !req.session.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. User ID not found in session.",
            });
        }

        const createdBy = req.session.user.id; // Get the user ID from the session

        // Basic validation for required fields
        if (!orgId || !title || !columns || !rows) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: orgId, title, columns, and rows are necessary.",
            });
        }

        // Validate orgId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid orgId format.",
            });
        }

        // 2. Prepare the data for update/creation
        const workspaceData = {
            orgId: orgId,
            title: title,
            content: content || '', // Default to empty string if content is not provided
            page: {
                columns: columns,
                rows: rows,
            },
            createdBy: createdBy, // This will be set on creation, or remain the same on update
        };

        // 3. Find and Update (or Create) the Workspace Document
        // We'll try to find a workspace by orgId and title.
        // If you intend to have only ONE workspace table per org, you might remove 'title' from the query.
        // For simplicity, let's assume one primary workspace table per org for now.
        // If you want to allow multiple tables per org, you'd need a unique identifier for each table.
        const query = { orgId: orgId };
        // If you want to allow updating a specific workspace by title for an org:
        // const query = { orgId: orgId, title: title }; // Be careful with this if titles can change

        const updatedWorkspace = await Workspace.findOneAndUpdate(
            query,
            workspaceData,
            {
                new: true, // Return the updated document (or the newly created one)
                upsert: true, // Create a new document if no document matches the query
                setDefaultsOnInsert: true, // Apply schema defaults when upserting
            }
        );

        if (!updatedWorkspace) {
            // This case should ideally not be hit with upsert:true unless there's a severe DB issue
            return res.status(500).json({
                success: false,
                message: "Failed to update or create workspace data.",
            });
        }

        // 4. Return success response
        return res.status(200).json({
            success: true,
            message: "Workspace data updated/created successfully.",
            data: updatedWorkspace, // Return the updated/created document
        });

    } catch (error) {
        console.error("Error updating/creating workspace data:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing workspace data.",
            error: error.message,
        });
    }
};