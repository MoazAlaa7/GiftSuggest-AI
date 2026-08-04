import "./App.css";
import { useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

function App() {
  const [response, setResponse] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const prompt = formData.get("user-input").toString().trim();

    setResponse("");
    setIsPending(true);

    try {
      const response = await fetch("/api/gift", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullResponse = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        fullResponse += decoder.decode(value);

        setResponse(fullResponse);
      }
    } catch (error) {
      setResponse("Something went wrong. Please try again later.");
    } finally {
      setIsPending(false);
    }
  }

  const html = marked.parse(response || "");
  const cleanHTML = DOMPurify.sanitize(html);

  return (
    <div className="app-container">
      <header>
        <img src="/favicon.png" alt="gift box image" />
        <h1>AI Gift Suggestion</h1>
      </header>

      <main className="main-content">
        <form onSubmit={handleSubmit} id="gift-form" className="gift-form">
          <textarea
            id="user-input"
            name="user-input"
            aria-label="Type your message"
            placeholder="e.g., My friend who loves hiphop music has a birthday coming up in 3 days. suggest a gift.."
          ></textarea>

          <button
            type="submit"
            id="submit-button"
            className="submit-btn"
            disabled={isPending}
          >
            {isPending ? "Generating..." : "Generate ideas"}
          </button>
        </form>

        <section className="output-section">
          <div id="output-container" className={response && "visible"}>
            <div
              id="output-content"
              dangerouslySetInnerHTML={{ __html: cleanHTML }}
            ></div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
