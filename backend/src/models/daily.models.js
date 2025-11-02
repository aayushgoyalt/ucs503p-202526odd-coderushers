import mongoose, {Schema} from "mongoose";

const dailySchema = new Schema(
    {
        date: {
            type: Date,
            required: true,
            unique: true,
            index: true,
        },
        slug: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Daily = mongoose.model('Daily', dailySchema);