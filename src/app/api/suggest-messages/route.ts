// Import the OpenAI client
import OpenAI from "openai";
// Import helpers from the Vercel AI SDK
import { OpenAIStream, StreamingTextResponse } from "ai/openai";
import { NextRequest } from "next/server";

// Create an OpenAI client (edge friendly)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Set runtime to edge for best performance
export const runtime = "edge";

// POST API handler
export async function POST(req: NextRequest) {
    try {
        // Define the prompt for generating 3 open-ended questions
        const prompt = `
Create a list of three open-ended and engaging questions formatted as a single string.
Each question should be separated by '||'.
These questions are for an anonymous social messaging platform, like Qooh.me,
and should be suitable for a diverse audience.
Avoid personal or sensitive topics, focusing instead on universal themes
that encourage friendly interaction.

Example output:
"What's a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?"

Ensure the questions are intriguing, foster curiosity, and contribute
to a positive and welcoming conversational environment.
`;

        // Call OpenAI API to get a streaming chat completion
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Use the standard chat model
            max_tokens: 400,
            stream: true, // Enable streaming
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        // Convert the OpenAI streaming response into a ReadableStream
        const stream = OpenAIStream(response);

        // Return the stream as a StreamingTextResponse for proper headers
        return new StreamingTextResponse(stream);

    } catch (error) {
        // Handle errors
        console.error("Unexpected error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}