import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Dsa } from "../models/dsa.models.js";
import { isValidObjectId } from "mongoose";
import axios from "axios";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken}
    } catch (error) {
        console.error("Error during token generation:", error);
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const Signup = asyncHandler(async (req, res) => {
    const { username, fullName, password } = req.body;

    if (!username || !fullName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
        throw new ApiError(400, "Username already exists");
    }

    

    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        password,
    });


    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }


    return res.status(201).json(
        new ApiResponse(201, "User created successfully", { createdUser })
    );
});

const Login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;


    if (!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }    

    const user = await User.findOne({ username }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid username");
    }

    

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
    // console.error("Invalid password for user:", user.username);
    throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);    
    
    const LoggedInUser = await User.findById(user._id).select("-password -refreshToken");
    if (!LoggedInUser) {
        console.error("Failed to fetch logged-in user:", user._id);
        throw new ApiError(500, "Failed to fetch logged-in user");
    }
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .status(200)
    .json(
        new ApiResponse(
            200, 
            "Login successful",
            {
                user: LoggedInUser,refreshToken,accessToken
            },
        )
    );
});

const Logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.
    status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            "Current user fetched successfully", 
            { user: req.user }
        )
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both old and new passwords are required");
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, "Password changed successfully",user)
  );
});

const syncLeetcode = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!isValidObjectId(userId)) throw new ApiError(400, "User ID is not valid");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const username = user.username;
  if (!username) throw new ApiError(400, "Username is required for syncing");

  const limit = 20;
  const solvedMap = new Map(user.DSAsolvedProblems.map(entry => [entry.question.toString(), entry.solvedOn]));
  const seenSlugs = new Set();

  const response = await axios.post(
    "https://leetcode.com/graphql",
    {
      query: `
        query getUserData($username: String!, $limit: Int!) {
          matchedUser(username: $username) {
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
      variables: { username, limit },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Referer": `https://leetcode.com/${username}/`,
        "User-Agent": "Mozilla/5.0",
      },
    }
  );

  const data = response.data?.data;
  if (!data?.matchedUser) throw new ApiError(404, "LeetCode profile not found");

  const submissions = data.recentAcSubmissionList || [];
  const slugs = submissions.map(sub => sub.titleSlug);
  const dbQuestions = await Dsa.find({ slug: { $in: slugs } });
  const questionMap = new Map(dbQuestions.map(q => [q.slug, q]));

  let newSolvedCount = 0;

  for (const sub of submissions) {
    if (seenSlugs.has(sub.titleSlug)) continue;
    seenSlugs.add(sub.titleSlug);

    const dbQuestion = questionMap.get(sub.titleSlug);
    if (!dbQuestion) continue;

    const qIdStr = dbQuestion._id.toString();
    const solvedDate = new Date(Number(sub.timestamp) * 1000);

    if (!solvedMap.has(qIdStr)) {
      solvedMap.set(qIdStr, solvedDate);
      newSolvedCount++;
    }
  }

  if (newSolvedCount > 0) {
    user.DSAsolvedProblems = Array
      .from(solvedMap.entries())
      .map(([questionId, solvedOn]) => ({ question: questionId, solvedOn }))
      .sort((a, b) => b.solvedOn - a.solvedOn);
  }

  const stats = data.matchedUser.submitStatsGlobal.acSubmissionNum;
  const get = d => stats.find(s => s.difficulty === d)?.count || 0;

  user.dsaProblems = {
    total: get("All"),
    easy: get("Easy"),
    medium: get("Medium"),
    hard: get("Hard"),
  };

  user.lastSynced = new Date();
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, "Daily solved problems synced", {
      totalSolved: get("All"),
      easySolved: get("Easy"),
      mediumSolved: get("Medium"),
      hardSolved: get("Hard"),
      newlyAdded: newSolvedCount,
      lastSynced: user.lastSynced,
    })
  );
});

const getDSAstats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "User ID is not valid");
    }
    // console.log(userId);
    

    // const user = await User.findById(userId).populate("DSAsolvedProblems.question");
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    console.log(user.dsaProblems);

    const stats = {
        totalSolved: user.dsaProblems.total,
        easySolved: user.dsaProblems.easy,
        mediumSolved: user.dsaProblems.medium,
        hardSolved: user.dsaProblems.hard,
        lastSynced: user.lastSynced ? user.lastSynced.toISOString() : null,
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            "User stats fetched successfully", 
            { stats }
        )
    );

});

export { Signup, Login, Logout, getCurrentUser, changePassword ,syncLeetcode,getDSAstats}