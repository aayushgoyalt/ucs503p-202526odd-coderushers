import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Contest } from "../models/contest.models.js";
import axios from "axios";
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);


const trialScrape = asyncHandler(async (req, res) => {
    // const contests = await scrapeCodeChef();
    // const contests = await scrapeCodeforces();
    // const contests = await scrapeLeetCode();
    const contests = await scrapeAllContests();

    if (!contests) {
        throw new ApiError(500, "Failed to fetch data from API");
    }
    // console.log("Final:- ", contests);
    

    return res.status(200).json(
        new ApiResponse(true, "Contests fetched successfully", contests)
    );
    
});

const scrapeAllContests = async () => {
    const codeChefContests = await scrapeCodeChef();
    const codeforcesContests = await scrapeCodeforces();
    const leetCodeContests = await scrapeLeetCode();

    if(!leetCodeContests){
        throw new ApiError(500, "Failed to fetch LeetCode contests");
    }
    if(!codeforcesContests){
        throw new ApiError(500, "Failed to fetch Codeforces contests");
    }
    if(!codeChefContests){
        throw new ApiError(500, "Failed to fetch CodeChef contests");
    }

    const allContests = [
        ...codeChefContests,
        ...codeforcesContests,
        ...leetCodeContests
    ];

    return allContests
}

const AddContest = asyncHandler(async (req, res) => {
    const contests = await scrapeAllContests();

    if (!Array.isArray(contests)) {
        throw new ApiError("ScrapeAll did not return an array");
    }

    const inserted = [];
    const skipped = [];

    for (const contest of contests) {
        const alreadyExists = await Contest.findOne({
            name: contest.name,
            platform: contest.platform,
            startTime: contest.startTime,
        });

        if (alreadyExists) {
            skipped.push(contest);
        } else {
            const created = await Contest.create(contest);
            inserted.push(created);
        }
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            true,
            "Contests added successfully",
            {
                insertedCount: inserted.length,
                skippedCount: skipped.length,
                inserted,
                skipped,
            }
        )
    );
});

const getActiveContests = asyncHandler(async (req, res) => {
    const today = dayjs.utc();
    const contests = await Contest.find({
        active: true,
    }).sort({ date: 1, startTime: 1 });

    const awaitedContests = [];
    const upcomingContests = [];

    for (const contest of contests) {
        const end = dayjs.utc(contest.endTime);
        if (today.isSameOrAfter(end)) {
        awaitedContests.push(contest); 
        } else {
        upcomingContests.push(contest);
        }
    }


    if (!contests || contests.length === 0) {
        return res.status(404).json(
            new ApiResponse(false, "No active contests found")
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            true, 
            "Active contests fetched successfully", 
            {
                contestLength:contests.length,
                awaited:awaitedContests.length,
                upcoming:upcomingContests.length,
                awaitedContests,
                upcomingContests
            }
        )
    );
});
    



const scrapeLeetCode = async () => {
    try {
        const data = await axios.post(
            "https://leetcode.com/graphql",
            {
                query: `query 
                    upcomingContests {  
                        upcomingContests {
                            title
                            titleSlug
                            startTime
                            duration
                            __typename  
                        }
                    }
                `,
                variables: {},
            },
            {
                headers: {
                "Content-Type": "application/json",
                Referer: "https://leetcode.com",
                "User-Agent": "Mozilla/5.0",
                },
            }
        );

        const futureContests = data.data.data.upcomingContests;

        // console.log("Upcoming LeetCode contests:", futureContests);
        

        const formattedContests = futureContests.map((contest) => {
            const start = dayjs.utc(contest.startTime * 1000);
            const end = start.add(contest.duration, "seconds");
            let division = "LC";
            const nameLower = contest.title.toLowerCase();

            if (nameLower.includes("weekly contest")) {
                division = "weekly";
            } else if (nameLower.includes("biweekly contest")) {
                division = "biweekly";
            }

            return {
                name: contest.title,
                startTime: start.toDate(),
                endTime: end.toDate(),
                duration: contest.duration / 60, 
                link: `https://leetcode.com/contest/${contest.titleSlug}/`,
                platform: "LeetCode",
                type: division, 
            };
        });

        return formattedContests;
    }
    catch (error) {
        console.error("LeetCode scraping failed:", error.message);
        return null;
    }
}

const scrapeCodeforces = async () => {
    try {
        const { data } = await axios.get("https://codeforces.com/api/contest.list");

        const upcomingContests = data.result.filter(contest =>contest.phase === "BEFORE" && dayjs.utc(contest.startTimeSeconds * 1000).isSameOrAfter(dayjs.utc()));
        // console.log("Upcoming Codeforces contests:", upcomingContests.length);
        

        const formattedContests = upcomingContests.map((contest) => {
            let division = "Unknown";
            const nameLower = contest.name.toLowerCase();

            if (nameLower.includes("div. 1 + div. 2")) {
                division = "div1_2";
            } else if (nameLower.includes("div. 1")) {
                division = "div1";
            } else if (nameLower.includes("div. 2")) {
                division = "div2";
            } else if (nameLower.includes("div. 3")) {
                division = "div3";
            } else if (contest.type === "ICPC") {
                division = "CF"; // fallback for ICPC
            }

            return {
                name: contest.name,
                startTime: dayjs.utc(contest.startTimeSeconds * 1000).toDate(),
                endTime: dayjs
                .utc(contest.startTimeSeconds * 1000)
                .add(contest.durationSeconds, "seconds")
                .toDate(),
                duration: contest.durationSeconds / 60,
                link: `https://codeforces.com/contests/${contest.id}`,
                platform: "Codeforces",
                type: division,
            };
        });

        // console.log("Formatted Codeforces contests:", formattedContests);
        

        return formattedContests;
        
    } catch (error) {
        console.error("Codeforces scraping failed:", err.message);
        return null;
    }
};

const scrapeCodeChef = async () => {
  try {
    const { data } = await axios.get("https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all");
    
    const upcomingContests = data?.future_contests || [];
    // console.log("Upcoming:-",upcomingContests);

    const formattedContests = upcomingContests
    .filter((contest) => !contest.contest_name.toLowerCase().includes("dev"))
    .map((contest) => ({
        name: contest.contest_name,
        startTime: new Date(contest.contest_start_date_iso),
        endTime: new Date(contest.contest_end_date_iso),
        duration: parseInt(contest.contest_duration),
        link: "https://www.codechef.com/contests",
        platform: "CodeChef",
        type: "CC",
    }));
    // console.log("Formatted: ",formattedContests);
    

    return formattedContests;
  } catch (err) {
    console.error("CodeChef scraping failed:", err.message);
    return null;
  }
};

const makeArchive = asyncHandler(async (req, res) => {
    const {contestIds} = req.body;
    if (!contestIds || !Array.isArray(contestIds)) {
        throw new ApiError(400, "Invalid contest IDs");
    }

    await Contest.updateMany(
        { _id: { $in: contestIds } },
        { $set: { active: false } }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            true,
            "Contests archived successfully",
            {
                archivedCount: contestIds.length,
            }
        )
    )
});






export {trialScrape,scrapeCodeChef, scrapeCodeforces,scrapeLeetCode,scrapeAllContests,AddContest,getActiveContests,makeArchive};