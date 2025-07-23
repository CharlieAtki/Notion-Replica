import mongoose from 'mongoose'

const workplaceSchema = mongoose.Schema({
    orgId: { // ObjectId of the workspaces related org
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
        required: true,
    },
    createdBy: { // ObjectId of user that created the workspace
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: String, // Title of the organisation
    content: String, // (could break down into smaller titles etc)
},
    {
        timestamps: true,
        collection: 'workspaces',
    }
);

const Workspace = mongoose.model('Workspace', workplaceSchema);
export default Workspace;