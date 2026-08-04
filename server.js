import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.API_URL,
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

app.post("/api/gift", async (req, res) => {
  try {
    const { prompt } = req.body;

    const stream = await client.responses.create({
      model: process.env.AI_MODEL,

      input: [
        systemMessage,
        {
          role: "user",
          content: prompt,
        },
      ],

      stream: true,
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        res.write(event.delta);
      }
    }

    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).end("Something went wrong.");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
