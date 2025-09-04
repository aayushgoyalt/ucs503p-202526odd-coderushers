import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: false 
        },
        refreshToken: {
            type: String
        },
        total:{
            type: Number,
            default: 0
        },
        easy: {
            type: Number,
            default: 0
        },
        medium: {
            type: Number,
            default: 0
        },
        hard: {
            type: Number,
            default: 0
        },
        solvedProblems: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Question',
                    required: true
                },
                solvedOn: {
                    type: Date,
                    default: () => new Date(),
                    required: true
                }
            }
        ],
        lastSynced: {
            type: Date,
            default: null,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        lastMissedDate: {
            type: Date,
            default: null,
        },
        contestPrefrences:[
            {
                type: String,
                default:"null"
            }
        ]
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema,"users")