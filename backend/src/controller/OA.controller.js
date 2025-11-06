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

const endOA = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const oa = await OA.findOne({ user: userId, status: "active" }).populate("questions.question");
  if (!oa) {
    return res.status(204).json({ success: true, message: "No active OA found for this user.!" });
  }

  oa.status = "expired";
  oa.endedAt = new Date();
  await oa.save();
  
  res.status(200).json( 
    new ApiResponse(true, "OA ended successfully", {
      oaId: oa._id,
      endedAt: oa.endedAt,
    })
  );
});




const getOAstatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const oa = await OA.findOne({ user: userId, status: "active" }).populate("questions.question");
  if (!oa) {
    return res.status(204).json({ success: true, message: "No active OA found for this user.!" });
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
    return res.status(404).json({ success: true, message: "User not found." });
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


const getOAhistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;


  const oas = await OA.find({
    user: userId,
    status: { $in: ["completed", "expired"] }
  })
    .sort({ endedAt: -1, createdAt: -1 })
    .limit(5)
    .populate("questions.question")
    .lean();


  const emptyAggregate = {
    sessions: 0,
    totalQuestions: 0,
    totalCompleted: 0,
    completionRatePercent: 0,
    totalTimeMinutes: 0,
    avgSessionDurationMinutes: 0,
    difficultyBreakdown: { Easy: 0, Medium: 0, Hard: 0 }
  };

  if (!oas || oas.length === 0) {
    return res.status(200).json(
      new ApiResponse(true, 200, "No OA history found", {
        recent: [],
        aggregate: emptyAggregate
      })
    );
  }

  const recent = [];
  const agg = {
    sessions: oas.length,
    totalQuestions: 0,
    totalCompleted: 0,
    totalTimeMinutes: 0,
    difficultyBreakdown: { Easy: 0, Medium: 0, Hard: 0 }
  };

  const safeDifficulty = (qDoc, qItem) => {
    if (qDoc && qDoc.difficulty) return qDoc.difficulty;
    if (qItem && qItem.difficulty) return qItem.difficulty;
  };

  for (const oa of oas) {

    let durationMinutes = null;
    if (oa.startedAt && oa.endedAt) {
      durationMinutes = Math.round((new Date(oa.endedAt) - new Date(oa.startedAt)) / 60000);
    } else if (oa.startedAt && !oa.endedAt) {

      durationMinutes = Math.round((Date.now() - new Date(oa.startedAt)) / 60000);
    }

    const questions = (oa.questions || []).map((q) => {
      const qDoc = q.question ?? null;
      const difficulty = safeDifficulty(qDoc, q);
      return {
        id: qDoc?._id ?? q.question,
        title: qDoc?.title ?? null,
        slug: q.slug ?? qDoc?.slug ?? null,
        difficulty,
        status: q.status,
        completedOn: q.completedOn ?? null,
        url: qDoc?.slug ? `https://leetcode.com/problems/${qDoc.slug}/` : null
      };
    });


    const sessionDifficultyCounts = { Easy: 0, Medium: 0, Hard: 0};
    for (const qq of questions) {
      if (qq.difficulty === "Easy") sessionDifficultyCounts.Easy++;
      else if (qq.difficulty === "Medium") sessionDifficultyCounts.Medium++;
      else if (qq.difficulty === "Hard") sessionDifficultyCounts.Hard++;
    }

    const sessionTotalQuestions = oa.totalQuestions ?? questions.length;
    const sessionCompleted = oa.completedCount ?? questions.filter(q => q.status === "completed").length;
    const sessionCompletionRate = sessionTotalQuestions > 0
      ? Math.round((sessionCompleted / sessionTotalQuestions) * 100)
      : 0;


    agg.totalQuestions += sessionTotalQuestions;
    agg.totalCompleted += sessionCompleted;
    if (durationMinutes !== null) agg.totalTimeMinutes += durationMinutes;
    for (const k of Object.keys(sessionDifficultyCounts)) {
      agg.difficultyBreakdown[k] += sessionDifficultyCounts[k];
    }

    recent.push({
      oaId: oa._id,
      status: oa.status,
      startedAt: oa.startedAt,
      endedAt: oa.endedAt,
      durationMinutes,
      totalQuestions: sessionTotalQuestions,
      completedCount: sessionCompleted,
      completionRatePercent: sessionCompletionRate,
      difficultyCounts: sessionDifficultyCounts,
      questions,
      createdAt: oa.createdAt,
      updatedAt: oa.updatedAt
    });
  }

  const aggregate = {
    sessions: agg.sessions,
    totalQuestions: agg.totalQuestions,
    totalCompleted: agg.totalCompleted,
    completionRatePercent: agg.totalQuestions > 0 ? Math.round((agg.totalCompleted / agg.totalQuestions) * 100) : 0,
    totalTimeMinutes: agg.totalTimeMinutes,
    avgSessionDurationMinutes: agg.sessions > 0 ? Math.round(agg.totalTimeMinutes / agg.sessions) : 0,
    difficultyBreakdown: agg.difficultyBreakdown
  };

  return res.status(200).json(
    new ApiResponse(
      {
        recent,
        aggregate
      },
      true, 200, "Recent OA history retrieved"
    )
  );
});


export { verifyExtension, createOA, getOAstatus, endOA, validateSubmission, deleteOA, getOAhistory };