import OpenAI from "openai";
import { API_KEY, API_URL, AI_MODEL } from "/env";

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: API_URL,
  dangerouslyAllowBrowser: true,
});

export default async function getSuggestions() {
  const prompt = "Suggest some gifts for someone who loves cats";

  console.log("Prompt:", prompt);
  console.log("Making AI request...");

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log("AI response:");
    console.log(response.choices[0].message.content);
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      console.error(
        "Authentication error: Check your AI_KEY and make sure it’s valid.",
      );
    } else if (err.status >= 500) {
      console.error(
        "AI provider error: Something went wrong on the provider side. Try again shortly.",
      );
    } else {
      console.error("Unexpected error:", err.message || err);
    }
  }
}
