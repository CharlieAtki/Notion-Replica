// workspaceController.js
import Workspace from "../models/Workspace.js";
import mongoose from "mongoose";
import User from "../models/User.js";

export const getWorkspaceTableData = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.currentOrgId) {
            return res.status(401).json({
                success: false,
                message: "User session or organization ID is missing.",
            });
        }

        const user = await User.findOne({ email: req.session.user.email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        const workspaces = await Workspace.find({
            orgId: user.currentOrgId,
        });

        if (!workspaces || workspaces.length === 0) {
            // If no workspace found, return a default empty structure including title and content
            return res.status(200).json({ // Changed to 200 for initial empty state
                success: true,
                message: "No Workspace data found for this organization. Returning default.",
                title: "Untitled Workspace", // Default title
                content: "", // Default content
                columns: [], // Empty columns
                rows: [],    // Empty rows
            });
        }

        // Assuming you want to fetch the first (or only) workspace's table data
        const workspace = workspaces[0]; // Get the first workspace document

        return res.status(200).json({
            success: true,
            title: workspace.title,     // Return workspace title
            content: workspace.content, // Return workspace content
            columns: workspace.page.columns, // Return columns from the page object
            rows: workspace.page.rows,       // Return rows from the page object
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
        const { orgId, title, content, columns, rows } = req.body; // Destructure title and content

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
        // We'll try to find a workspace by orgId. Assuming one primary workspace table per org.
        const query = { orgId: orgId };

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