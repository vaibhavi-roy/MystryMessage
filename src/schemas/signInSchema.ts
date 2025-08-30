import { z } from 'zod';

export const usernameValidation = z
    .string()
    .min(2, { message: "Username must be at least 2 characters" })
    .max(20, { message: "Username must be at most 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username must only contain letters, numbers, and underscores" });

// Updated Schema with password confirmation
export const signInSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Confirm Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Show the error on the confirmPassword field
});