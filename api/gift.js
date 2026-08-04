import OpenAI from "openai";

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

End with a section with an H2 heading titled "Questions for you".

Keep the response under 500 words.
`,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

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
}
