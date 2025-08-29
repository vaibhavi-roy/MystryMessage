import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
    content: string;
    createdAt: Date;
}

export const MessageSchema: Schema<Message> = new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
});

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
    username: { type: String, required: true, message: "Username is required", trim: true, },
    email: { type: String, required: true, unique: true, message: "Email is required", match: [/.+\@.+\..+/, 'please enter a valid email'] },
    password: { type: String, required: true, message: "Password is required" },
    verifyCode: { type: String, required: true, message: "Verification code is required" },
    verifyCodeExpiry: { type: Date, required: true, message: "Verification code expiry is required" },
    isVerified: { type: Boolean, default: false },
    isAcceptingMessages: { type: Boolean, default: true },
    messages: [MessageSchema]
});

//return datatype is of mongoose type User
//always check whether database connection already exists or not
const UserModel = (mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User", UserSchema));

export default UserModel;