import mongoose from 'mongoose'

const workplaceSchema = mongoose.Schema({
    orgId: { // ObjectId of the workspaces related org
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
        required: true,
    },
    // Structure for storing both rows and column definitions
    page: {
        rows: [{ // Define rows as an array of objects with flexible content
            type: mongoose.Schema.Types.Mixed
        }],
        columns: [{ // Define columns as an array of objects
            key: { type: String, required: true },
            label: { type: String, required: true },
            inputType: { type: String, required: true }, // e.g., "text", "select", "number"
            options: [String] // Optional, for "select" inputType
        }]
    },
    createdBy: { // ObjectId of user that created the workspace
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: String, // Title of the workspace
    content: String, // (could break down into smaller titles etc)
},
    {
        timestamps: true,
        collection: 'workspaces',
    }
);

const Workspace = mongoose.model('Workspace', workplaceSchema);
export default Workspace;