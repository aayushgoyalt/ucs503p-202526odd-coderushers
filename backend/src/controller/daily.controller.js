import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Daily } from "../models/daily.models.js";
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);

const getDailyQuestion = asyncHandler(async (req, res) => {
    const today = dayjs().utc().startOf('day');
    const dailyQuestion = await Daily.findOne({
        date: today.toDate()
    }); 
    if (!dailyQuestion) {
        throw new ApiError(404, "No daily question found for today");
    }
    return res.status(200).json(
        new ApiResponse(true, "Daily question fetched successfully", {
            question: dailyQuestion
        })
    );
});

export { getDailyQuestion };