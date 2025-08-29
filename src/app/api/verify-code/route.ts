import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
});

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { username, code } = body;

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({ username: decodedUsername });
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 404
                }
            );
        }

        const isCodeValid = (user.verifyCode === code);
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return Response.json(
                {
                    success: true,
                    message: "User verified successfully",
                },
                {
                    status: 200
                }
            );
        }
        else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expired",
                },
                {
                    status: 400
                }
            );
        } else {
            return Response.json(
                {
                    success: false,
                    message: "Invalid verification code",
                },
                {
                    status: 400
                }
            );
        }
    } catch (error) {
        console.error("Error verifying user:", error);
        return Response.json(
            {
                success: false,
                message: "Error verifying user",
            },
            {
                status: 500
            }
        );
    }
}