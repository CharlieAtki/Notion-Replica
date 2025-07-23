import mongoose from "mongoose";

const organisationSchema = mongoose.Schema({
    name: String,
    slug: String,
    createdBy: { // user ObjectId that created the org
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: { // User ObjectIds that are part of the org
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
},
    {
        timestamps: true,
        collection: "organisations",
    }
);


const Organisation = mongoose.model("Organisation", organisationSchema);
export default Organisation;