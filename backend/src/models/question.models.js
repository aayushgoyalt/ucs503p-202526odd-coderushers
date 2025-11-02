import mongoose from "mongoose";
import { Schema } from "mongoose";

const QuestionSchema = new Schema(
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
    slug: {
        type: String,
        unique: true,
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
    },
    topics: {
        type: [String],
        default: [],
        index: true,
    },
    companyTags: {
        type: [String],
        default: [],
        index: true,
    }
  },
  {
    timestamps: true,
  }
);

export const Question = mongoose.model('Question', QuestionSchema);