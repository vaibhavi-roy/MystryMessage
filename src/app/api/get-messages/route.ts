import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect();

    //extract session and user
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated"
            },
            {
                status: 401 //the request has not been applied because it lacks valid authentication credentials for the target resource
            }
        )
    }
    const userId = new mongoose.Types.ObjectId(user._id); //string converted to mongoose ObjectId
    try {
        //mongodb aggregation pipeline
        const user = await UserModel.aggregate([
            {
                $match: {
                    id: userId
                }
            },
            {
                //unwind array, convert array to multiple objects, we can sort or perform other operations on array
                $unwind: "$messages"
            },
            { $sort: { "messages.createdAt": -1 } }, //sort messages by createdAt in descending order
            {
                $group: {
                    _id: "$_id",
                    messages: { $push: "$messages" }
                }
            }
        ])
        if (!user || user.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        }
        return Response.json(
            {
                success: true,
                messages: user[0].messages
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.log("An unexpected error occured", error)
        return Response.json(
            {
                success: false,
                message: "An unexpected error occured"
            },
            {
                status: 500
            }
        )
    }
}