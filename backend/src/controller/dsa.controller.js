import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Dsa } from "../models/dsa.models.js";
import { User } from "../models/user.model.js";
import axios from "axios";

const getAllQuestions = asyncHandler(async (req, res) => {
    const {difficulty, topics, companyTags,title} = req.query;

    const query = {};
    if (difficulty) {
        // console.log("Difficulty filter applied:", difficulty);
        query.difficulty = difficulty;
    }
    if (topics) {
        // console.log("Topics filter applied:", topics);
        query.topics = { $in: topics.split(",") };
    }
    if (companyTags) {
        // console.log("Company Tags filter applied:", companyTags);
        query.companyTags = { $in: companyTags.split(",") };
    }
    if (title) {
        // console.log("Title filter applied:", title);
        query.title = { $regex: title, $options: "i" }; 
    }

    const questions = await Dsa.find(query).sort({ createdAt: -1 });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Questions fetched successfully",
            { 
                total: questions.length,
                questions
            }
        )
    );
});

const getQuestionById = asyncHandler(async (req, res) => {
    const { Qid } = req.params;
    if(!Qid) {
        throw new ApiError(400, "Question ID is required");
    }

    const question = await Dsa.findOne({ Qid:Qid });

    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Question fetched successfully",
            { question }
        )
    );
});

const giveTopics = asyncHandler(async (req, res) => {
  
  let { topic } = req.params;

  if (!topic || topic === "null") topic = "Array"; 
  const query = { topics: topic };
  console.log(query);

  const questions = await Dsa.find({ topics: topic });
    // console.log(questions);
  if (!questions || questions.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No questions found for this topic"));
  }

  const userId = req.user.id;
  const user = await User.findById(userId).select("solvedProblems");
  if (!user) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }
  // console.log(user);
  

  const solvedSet = new Set(
    (user.DSAsolvedProblems || []).map((entry) => entry.question.toString())
);

    let annotatedQuestions = questions.map((q) => {
      const isSolved = solvedSet.has(q._id.toString());
      return {
        ...q.toObject(),
        solved: isSolved
      };
    });

  const solvedCount = annotatedQuestions.reduce(
    (count, q) => count + (q.solved !== false ? 1 : 0),
    0
  );

  return res.status(200).json(
    new ApiResponse(200, "Questions fetched successfully", {
      total: annotatedQuestions.length,
      solvedCount,
      questions: annotatedQuestions
    })
  );
});

const giveCompany = asyncHandler(async (req, res) => {
  let { company} = req.params;

  if (!company || company=="null") company = "Amazon";

  const query = { companyTags: company };

  const questions = await Dsa.find(query);

  if (!questions || questions.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No questions found for this company"));
  }

  const userId = req.user.id;
  const user = await User.findById(userId).select("solvedProblems");
  if (!user) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }

  const solvedSet = new Set(
    (user.DSAsolvedProblems || []).map((entry) => entry.question.toString())
  );

    let annotatedQuestions = questions.map((q) => {
      const isSolved = solvedSet.has(q._id.toString());
      return {
        ...q.toObject(),
        solved: isSolved
      };
    });


  const solvedCount = annotatedQuestions.reduce(
    (count, q) => count + (q.solved !== false ? 1 : 0),
    0
  );

  return res.status(200).json(
    new ApiResponse(200, "Questions fetched successfully", {
      total: annotatedQuestions.length,
      solvedCount,
      questions: annotatedQuestions
    })
  );
});


export { getAllQuestions, getQuestionById ,giveTopics,giveCompany};