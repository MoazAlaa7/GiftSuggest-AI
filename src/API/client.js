import OpenAI from "openai";
import { API_KEY, API_URL, AI_MODEL } from "/env";

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: API_URL,
  dangerouslyAllowBrowser: true,
});

const systemMessage = {
  role: "system",
  content: `
            Make your gift suggestions thoughtful and practical.
            Skip intros and conclusions.
            Only output gift suggestions.
            Your response must be under 300 words.
            Adhere strictly to the user's specified price range (if provided).
            Do not recommend age-inappropriate, legally restricted, or sensitive items (e.g., alcohol, weapons, tobacco, or adult content)
            If a question is outside of gift suggestions, politely decline to answer.`,
};

export default async function getSuggestions(prompt, onChunk) {
  try {
    const stream = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        systemMessage,
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0].delta.content;

      if (chunkContent) {
        fullResponse += chunkContent;
        onChunk(fullResponse);
      }
    }

    return fullResponse;
  } catch (err) {
    throw new Error("Sorry, something went wrong. Please try again in a bit.", {
      cause: err,
    });
  }
}
