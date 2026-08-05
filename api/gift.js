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

Answer in the same language as the prompt.
- If the user writes in Egyptian Colloquial Arabic (العامية المصرية), respond in Egyptian Colloquial Arabic.
- Do NOT use formal Modern Standard Arabic (الفصحى) unless the user is clearly writing in formal Arabic.
- Use the vocabulary that Egyptian internet and shopping users naturally use, even when it contains English loanwords written in Arabic.

Guidelines:
- Prefer common Egyptian everyday terminology over literal translations.
- When a loanword is significantly more common in Egypt than its Arabic translation, always prefer the loanword.
- Keep internationally recognized product names, brands, technologies, and common tech terms in English (or their common Arabic transliteration) instead of translating them literally.
- Sound like a helpful Egyptian salesperson or friend, not a dictionary.
Examples:
✅ ماوس باد
❌ بطانة فأرة
❌ بطاقة ماوس

✅ هارد سريع
❌ قرص صلب سريع

✅ هارد خارجي
❌ قرص صلب خارجي

✅ بوستر فيلم
❌ ملصق فيلم
❌ ملصق حائط فيلم

✅ باور بانك
❌ بنك طاقة

✅ سبيكر بلوتوث
❌ مكبر صوت يعمل بتقنية البلوتوث

✅ كيبورد ميكانيكال
❌ لوحة مفاتيح ميكانيكية (unless the user is being formal)

✅ ماوس جيمينج
❌ فأرة ألعاب

✅ تي شيرت
❌ قميص قطني قصير الأكمام


Each gift must:
- Have a clear heading preferably h3 (never h1 or strong).
- A short explanation of why it would work for the recipient.

End with a section with an H2 heading titled "Questions for you" or "أسئلة ممكن تساعدك".

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
