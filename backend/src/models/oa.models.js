import mongoose from "mongoose";

const OASchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    questions: [
      {
        question: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Question", 
          required: true 
        },
        slug: { 
          type: String, 
          required: true, 
          trim: true 
        },
        status: { 
          type: String, 
          enum: ["pending", "completed"], 
          default: "pending" 
        },
        completedOn: { 
          type: Date, 
          default: null 
        },
      },
    ],

    totalQuestions: { 
      type: Number, 
      default: 4, 
      immutable: true 
    },

    completedCount: { 
      type: Number, 
      default: 0 
    },

    startedAt: { 
      type: Date, 
      default: () => new Date() 
    },

    endedAt: { 
      type: Date, 
      default: null 
    },

    status: { 
      type: String, 
      enum: ["active", "completed", "expired"], 
      default: "active" 
    },
  },
  { timestamps: true }
);

export const OA = mongoose.model("OA", OASchema);