import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "https://leetcode.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman) or from allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ Not allowed by CORS"));
      }
    },
    credentials: true
  })
);


app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/api/ping", (req, res) => {
  console.log("✅ /ping route hit");
  res.send("pong");
});

//routes import
import userRouter from "./routes/user.routes.js"
import questionRouter from "./routes/question.routes.js";
import studyPlanRouter from "./routes/studyplan.routes.js";
import contestRouter from "./routes/contest.routes.js";
import topic_companyRouter from "./routes/topic_company.routes.js";
import dailyRouter from "./routes/daily.routes.js";
import OARouter from "./routes/OA.routes.js";

//routes decalaration
app.use("/api/users", userRouter)
app.use("/api/ques", questionRouter)
app.use("/api/studyplan", studyPlanRouter)
app.use("/api/contest", contestRouter)
app.use("/api", topic_companyRouter)
app.use("/api", dailyRouter)
app.use("/api/oa", OARouter)


export { app }