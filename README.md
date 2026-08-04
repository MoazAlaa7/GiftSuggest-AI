# 🎁 GiftSuggest-AI

A lightweight React + Express app for generating gift ideas using the OpenAI JavaScript SDK and Grok-compatible APIs. <br>
Enter a gift prompt and receive structured gift suggestions from a large language model.

The backend uses the official `openai` npm package and streams model output to the browser in real time. Works with OpenAI-compatible models by configuring the API base URL.

Sanitized Markdown rendering with `marked` and `DOMPurify`

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file at the project root with:

```env
API_KEY=your_api_key
AI_MODEL=openai/gpt-oss-120b (or your model name)
API_URL=https://api.groq.com/openai/v1 (or your API provider URL)
PORT=3000
```

### Run the App

```bash
npm run dev
```

Then open `http://localhost:5173` and submit a gift prompt.
