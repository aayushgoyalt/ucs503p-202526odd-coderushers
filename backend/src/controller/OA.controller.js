import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { OA } from "../models/OA.models.js";
import { Question } from "../models/question.models.js";
import { User } from "../models/user.model.js";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);

const verifyExtension = asyncHandler(async (req, res) => {
  const username = req.body.username;
  const qid = req.body.qid;

  console.log("Username:", username);
  console.log("Question ID:", qid);
  console.log("Submission Time:", new Date().toISOString());

  return res.status(200).json(
    new ApiResponse(true, "Extension verified successfully", {
      username,
      qid,
    })
  );
});

const createOA = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const existingOA = await OA.findOne({ user: userId, status: "active" });
  if (existingOA) {
    return res.status(400).json({
      success: false,
      message: "You already have an active OA session.",
      oaId: existingOA._id,
    });
  }

  const [easyQs, mediumQs, hardQs] = await Promise.all([
    Question.aggregate([{ $match: { difficulty: "Easy" } }, { $sample: { size: 1 } }]),
    Question.aggregate([{ $match: { difficulty: "Medium" } }, { $sample: { size: 2 } }]),
    Question.aggregate([{ $match: { difficulty: "Hard" } }, { $sample: { size: 1 } }]),
  ]);

  const selected = [...easyQs, ...mediumQs, ...hardQs];

  if (selected.length !== 4) {
    return res.status(400).json({
      success: false,
      message: "Not enough questions available to create OA.",
    });
  }

  const oaData = {
    user: userId,
    questions: selected.map(q => ({
      question: q._id,
      slug: q.slug,
      status: "pending",
    })),
    totalQuestions: 4,
    startedAt: new Date(),
    endedAt: new Date(Date.now() + 90 * 60 * 1000),
    status: "active",
  };

  const newOA = await OA.create(oaData);

  res.status(201).json({
    success: true,
    message: "OA created successfully!",
    oa: {
      id: newOA._id,
      startedAt: newOA.startedAt,
      endsAt: newOA.endedAt,
      timeLimitMinutes: 90,
      questions: selected.map(q => ({
        id: q._id,
        title: q.title,
        slug: q.slug,
        difficulty: q.difficulty,
        url: `https://leetcode.com/problems/${q.slug}/`,
      })),
    },
  });
});

const getOAstatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const oa = await OA.findOne({ user: userId, status: "active" }).populate("questions.question");
  if (!oa) {
    throw new ApiError(404, "No active OA found for the user.");
  }

  if (dayjs().isSameOrAfter(dayjs(oa.endedAt))) {
    oa.status = "expired";
    await oa.save();
    throw new ApiError(400, "The OA session has expired.");
  }

  res.status(200).json(
    new ApiResponse(true, "OA status retrieved successfully", {
      oaId: oa._id,
      status: oa.status,
      startedAt: oa.startedAt,
      endsAt: oa.endedAt,
      timeLimitMinutes: 90,
      questions: oa.questions.map(q => ({
        id: q.question._id,
        title: q.question.title,
        slug: q.question.slug,
        difficulty: q.question.difficulty,
        status: q.status,
        completedOn: q.completedOn,
        url: `https://leetcode.com/problems/${q.question.slug}/`,
      })),
    })
  );
});

const validateSubmission = asyncHandler(async (req, res) => {
  const { username, qid, completed_on } = req.body;

  if (!username || !qid) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

//   console.log(username, qid, completed_on);

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  const oa = await OA.findOne({ user: user._id, status: "active" });
  if (!oa) {
    return res.status(400).json({ success: false, message: "No active OA found for this user." });
  }

  const question = await Question.findOne({ Qid: qid });
  if (!question) {
    return res.status(404).json({ success: false, message: "Question not found in DB." });
  }

  const targetQ = oa.questions.find(q => q.question.toString() === question._id.toString());
  if (!targetQ) {
    return res.status(403).json({ success: false, message: "This question is not part of the active OA." });
  }

  if (targetQ.status === "pending") {
    targetQ.status = "completed";
    targetQ.completedOn = completed_on ? new Date(completed_on) : new Date();
    oa.completedCount += 1;
  }

  if (oa.completedCount >= oa.totalQuestions) {
    oa.status = "completed";
    oa.endedAt = new Date();
  }

  await oa.save();

  res.json({
    success: true,
    message: "Submission validated successfully.",
    oaStatus: oa.status,
    completedCount: oa.completedCount,
    totalQuestions: oa.totalQuestions,
  });
});

const deleteOA = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const deletedOA = await OA.findOneAndDelete({ user: userId });
  if (!deletedOA) {
    throw new ApiError(404, "No OA found to delete.");
  }

  res.status(200).json(
    new ApiResponse(true, "OA deleted successfully", {
      deletedOAId: deletedOA._id,
      deletedAt: new Date(),
    })
  );
});

export { verifyExtension, createOA, getOAstatus, validateSubmission, deleteOA };