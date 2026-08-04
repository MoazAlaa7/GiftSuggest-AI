import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_API_KEY,
  baseURL: import.meta.env.VITE_API_URL,
  dangerouslyAllowBrowser: true,
});

const systemMessage = {
  role: "system",
  content: `
            Make your gift suggestions thoughtful and practical.
            Skip intros and conclusions.
            Only output gift suggestions.
            
            Each gift must: 
              - Have a clear heading
              - A short explanation of why it would work
            End with a section with an H2 heading titled "Questions for you" 
            that contains follow-ups that would help improve the gift suggestions.
            Your response must be in structured Markdown and under 500 words.

            Adhere strictly to the user's specified price range (if provided).
            Do not recommend age-inappropriate, legally restricted, or sensitive items (e.g., alcohol, weapons, tobacco, or adult content).
            If a question is outside of gift suggestions, politely decline to answer.`,
};

export default async function getSuggestions(prompt, onChunk) {
  try {
    const stream = await client.chat.completions.create({
      model: import.meta.env.VITE_AI_MODEL,
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
