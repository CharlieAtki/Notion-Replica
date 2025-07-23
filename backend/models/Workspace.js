// Workspace.js
import mongoose from 'mongoose'

const workplaceSchema = mongoose.Schema({
    orgId: { // ObjectId of the workspaces related org
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
        required: true,
    },
    // Structure of how the record information should be stored
    page: {
        // Define columns as an array of Mixed type to allow flexible column definitions
        columns: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        // Define rows as an array of Mixed type to allow flexible row data based on dynamic columns
        rows: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        }
    },
    createdBy: { // ObjectId of user that created the workspace
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: String, // Title of the workspace/organisation
    content: String, // Additional content/description for the workspace
},
    {
        timestamps: true,
        collection: 'workspaces',
    }
);

const Workspace = mongoose.model('Workspace', workplaceSchema);
export default Workspace;