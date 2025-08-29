import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
});

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);

        const queryParam = { username: searchParams.get("username") };
        //validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam);
        console.log(result) //todo: remove
        if (!result.success) {
            const usernameErrors = result.error.issues.map(issue => issue.message);
            return Response.json(
                {
                    success: false,
                    message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "Invalid query parameters",
                    errors: usernameErrors
                },
                {
                    status: 400
                }
            );
        }

        const { username } = result.data;
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true })
        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken",
                    errors: []
                },
                {
                    status: 400
                }
            );
        }
        return Response.json(
            {
                success: true,
                message: "Username is available",
                errors: []
            },
            {
                status: 400
            }
        );
    }
    catch (error) {
        console.error("Error checking username uniqueness:", error);
        return Response.json(
            {
                success: false,
                message: "Error checking username uniqueness",
            },
            {
                status: 500
            }
        );
    }
}