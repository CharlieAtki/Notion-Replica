import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    email: {
        type: String,
    },
    hashedPassword: {
        type: String,
    },
    orgs: [
        {
            orgId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Organisation",
            },
            name: String,
            role: String,
            joinedAt: Date,
        }
    ],
    currentOrgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
    }
},
    {
        timestamps: true,
        collection: "users",
    }
);

const User = mongoose.model("User", userSchema);
export default User; // Exporting the schema