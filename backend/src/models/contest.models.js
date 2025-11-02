import mongoose, {Schema} from "mongoose";

const contestSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        },
        duration: {
            type: Number,
            required: true,
            min: 0
        },
        link:{
            type: String,
            required: true,
            trim: true
        },
        platform: {
            type: String,
            required: true,
            enum: ["LeetCode", "Codeforces", "CodeChef"]
        },
        type:{
            type: String,
            enum: ["CC", "LC","weekly","biweekly","div1","div2","div3","div1_2","CF"],
            default: "Contest"
        },
        active: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps: true
    }
)

export const Contest = mongoose.model("Contest", contestSchema);