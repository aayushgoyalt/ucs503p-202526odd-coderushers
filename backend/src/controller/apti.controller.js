import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Apti } from "../models/apti.models.js";


const uploadBulkQuestions = asyncHandler(async (req, res) => {
  const data = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    throw new ApiError(400, "Request body must be a non-empty array of questions");
  }

  for (const item of data) {
    const { Qid, title, options, answer, explanation } = item;
    if (!Qid || !title || !options || !answer || !explanation) {
      throw new ApiError(
        400,
        "Each question must have Qid, title, options, answer, and explanation"
      );
    }
  }

  const operations = data.map((item) => ({
    updateOne: {
      filter: { Qid: item.Qid },
      update: { $setOnInsert: item },
      upsert: true,
    },
  }));

  const result = await Apti.bulkWrite(operations, { ordered: false });

  const insertedCount = result.upsertedCount || 0;

  return res.status(201).json(
    new ApiResponse(201, "Bulk upload complete", {
      totalReceived: data.length,
      inserted: insertedCount,
      skippedDuplicates: data.length - insertedCount,
    })
  );
});

export { uploadBulkQuestions };