import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Question } from "../models/question.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";

const syncLeetCodeQidSlug = asyncHandler(async (req, res) => {
  const endpoint = "https://leetcode.com/graphql";
  const limit = 50;
  let skip = 0;
  let total = Infinity;
  let updated = 0;

  while (skip < total) {
    const response = await axios.post(
      endpoint,
      {
        query: `
          query getProblems($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
            problemsetQuestionList: questionList(
              categorySlug: $categorySlug,
              limit: $limit,
              skip: $skip,
              filters: $filters
            ) {
              total: totalNum
              questions: data {
                questionFrontendId
                title
                titleSlug
                difficulty
                topicTags {
                  name
                }
                companyTagStats
              }
            }
          }
        `,
        variables: {
          categorySlug: "",
          limit,
          skip,
          filters: {}
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const data = response.data.data.problemsetQuestionList;
    total = data.total;
    const questions = data.questions;

    for (const q of questions) {
      const Qid = q.questionFrontendId;
      const title = q.title;
      const slug = q.titleSlug;
      const difficulty = q.difficulty;
      const topics = q.topicTags?.map((tag) => tag.name) || [];

      // Parse companyTagStats (JSON string → extract company names)
      let companyTags = [];
      try {
        const stats = JSON.parse(q.companyTagStats || "[]");
        companyTags = stats.map((tag) => tag.tagName);
      } catch (e) {
        companyTags = [];
      }

      await Question.findOneAndUpdate(
        { Qid },
        {
          $set: {
            title,
            slug,
            difficulty,
            topics,
            companyTags
          }
        },
        { upsert: true, new: true }
      );

      updated++;
    }

    console.log(`⏳ Processed ${skip + questions.length} of ${total}`);
    skip += limit;
  }

  return res.status(200).json(
    new ApiResponse(200, "✅ Synced LeetCode problems to database", {
      updated
    })
  );
});

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

    const questions = await Question.find(query).sort({ createdAt: -1 });

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

    const question = await Question.findOne({ Qid:Qid });

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




const addQues = asyncHandler(async (req, res) => {

    const {Qid} =req.body;
    if (!Qid) {
        throw new ApiError(400, "Question ID is required");
    }
    
    const existingQuestion = await Question.findOne({ Qid });
    
    
    if (existingQuestion) {
        throw new ApiError(400, "Question already exists");
    }
    
    const ques = await Question.create({
        Qid,
    });
    
    const createdQuestion = await Question.findById(ques._id);
    
    if (!createdQuestion) {
        throw new ApiError(500, "Question creation failed");
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Question created successfully",
            { createdQuestion }
        )
    )
});


const updateQuestion = asyncHandler(async (req, res) => {
    const { Qid } = req.params;
    const { title, slug, difficulty, topics, companyTags } = req.body;
    if (!Qid) {
        throw new ApiError(400, "Question ID is required");
    }

    const question = await Question.findOneAndUpdate(
        { Qid },
        { title, slug, difficulty, topics, companyTags },
        { new: true, runValidators: true }
    );
    if (!question) {
        throw new ApiError(404, "Question not found");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Question updated successfully",
            { question }
        )
    );
});

const deleteQuestion = asyncHandler(async (req, res) => {
    const { Qid } = req.params;
    if (!Qid) {
        throw new ApiError(400, "Question ID is required");
    }

    const question = await Question.findOneAndDelete({ Qid });
    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Question deleted successfully",
            { question }
        )
    );
});

const addBulkQuestions = asyncHandler(async (req, res) => {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new ApiError(400, "Invalid questions data");
    }
    const bulkOps = questions.map(q => ({
        updateOne: {
            filter: { Qid: q.Qid },
            update: { $setOnInsert: q },
            upsert: true
        }
    }));
    const result = await Question.bulkWrite(bulkOps);
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Bulk questions processed successfully",
            { 
                modifiedCount: result.modifiedCount, 
                upsertedCount: result.upsertedCount
            }
        )
    );
});


export {addQues,syncLeetCodeQidSlug,getAllQuestions,getQuestionById,updateQuestion,deleteQuestion,addBulkQuestions};