import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";


//toggle to accept or not accept message

export async function POST(request: Request) {
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
    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isAcceptingMessages: acceptMessages }, { new: true });
        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 401
                }
            )
        }
        return Response.json(
            {
                success: true,
                message: "Message acceptance status updated successfully",
                updatedUser
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.log("failed to update user status to accept messages")
        return Response.json(
            {
                success: false,
                message: "failed to update user status to accept messages"
            },
            {
                status: 500
            }
        )
    }
}

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
    const userId = user._id;
    try {
        const foundUser = await UserModel.findById(userId);
        if (!foundUser) {
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
                message: "User found",
                user: foundUser,
                isAcceptingMessages: foundUser.isAcceptingMessages
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Error in getting message acceptance status")
        return Response.json(
            {
                success: false,
                message: "Error in getting message acceptance status"
            },
            {
                status: 500
            }
        )
    }
}