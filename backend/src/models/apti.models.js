import mongoose from "mongoose";
import { Schema } from "mongoose";

const AptiSchema = new Schema(
  {
    Qid: {
        type: String,
        required: true,
        index: true,
        unique: true,
    },
    title: {
        type: String,
        trim: true,
    },
    options:{
        A:{
            type: String,
            required: true
        },
        B:{
            type: String,
            required: true
        },
        C:{
            type: String,
            required: true
        },
        D:{
            type: String,
            required: true
        }
    },
    answer:{
        type: String,
        required: true,
        enum: ["A", "B", "C", "D"],
    },
    explanation:{
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
    },
    topics: {
        type: [String],
        default: [],
        index: true,
    }
  },
  {
    timestamps: true,
  }
);

export const Apti = mongoose.model('Apti', AptiSchema);
