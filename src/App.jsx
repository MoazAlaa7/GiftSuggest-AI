import "./App.css";
import { useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";

function App() {
  const { t, i18n } = useTranslation();
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
      setResponse(t("errorMessage"));
    } finally {
      setIsPending(false);
    }
  }

  const html = marked.parse(response || "");
  const cleanHTML = DOMPurify.sanitize(html);

  return (
    <div className="app-container" dir={i18n.dir()}>
      <header>
        <img src="/favicon.png" alt="gift box image" />
        <h1>{t("appTitle")}</h1>
        <button
          type="button"
          className="lang-switch"
          onClick={() =>
            i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")
          }
        >
          {i18n.language === "ar" ? "EN" : "العربية"}
        </button>
      </header>

      <main className="main-content">
        <form onSubmit={handleSubmit} id="gift-form" className="gift-form">
          <textarea
            id="user-input"
            name="user-input"
            aria-label={t("ariaLabel")}
            placeholder={t("placeholder")}
          ></textarea>

          <button
            type="submit"
            id="submit-button"
            className="submit-btn"
            disabled={isPending}
          >
            {isPending ? t("buttonGenerating") : t("buttonGenerate")}
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
