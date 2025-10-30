import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();


const allowedOrigins = [
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
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
import userRoutes from "./routes/user.routes.js"
import dsaRoutes from "./routes/dsa.routes.js"
import aptiRoutes from "./routes/apti.routes.js"

//routes decalaration
app.use("/api/users", userRoutes)
app.use("/api/dsa", dsaRoutes)
app.use("/api/apti", aptiRoutes)

export { app }