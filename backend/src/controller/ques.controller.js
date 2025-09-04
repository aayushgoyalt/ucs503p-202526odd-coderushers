import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import utc from "dayjs/plugin/utc.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

dayjs.extend(isSameOrAfter);
dayjs.extend(utc);

const syncDaily = asyncHandler(async (req, res) => {
  const username = req.params.username;
  if (!username) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Username is required"));
  }

  const limit = 20;

  const response = await axios.post(
    "https://leetcode.com/graphql",
    {
      query: `
        query getUserData($username: String!, $limit: Int!) {
          matchedUser(username: $username) {
            username
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
          }
          recentAcSubmissionList(username: $username, limit: $limit) {
            id
            title
            titleSlug
            timestamp
          }
        }
      `,
      variables: {
        username,
        limit,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Referer: `https://leetcode.com/${username}/`,
        "User-Agent": "Mozilla/5.0",
      },
    }
  );


  return res.status(200).json(
    new ApiResponse(200, "Fetched data from LeetCode", response.data)
  );
});


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
  
export { syncDaily,syncLeetCodeQidSlug };