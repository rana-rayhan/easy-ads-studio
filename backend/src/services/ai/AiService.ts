import fs from "fs";
import { OLLAMA_MODEL, OLLAMA_URL } from "../../secrets/envSecret";

/*
AI features, powered by Ollama: a free AI that runs on your own computer (https://ollama.com).
No API key and no cost. The backend sends a POST request to Ollama on http://localhost:11434.

Every method follows the same steps:
  1. Write the instructions (system) and the question (prompt).
  2. Give Ollama a JSON "schema": the exact shape we want back. Ollama then answers with JSON in that shape.
     maxLength / maxItems in the schema stop small models from writing forever.
  3. Check and clean the answer (small models sometimes ignore limits, so we shorten text to Google's limits).

Google Ads text limits: headline max 30 characters, description max 90 characters.
*/

class AiService {
  // ==================== Private methods (used only inside this class) ====================

  // Send one question to Ollama and get JSON back in the shape of "schema".
  private static async askOllama({
    system,
    prompt,
    schema,
    images,
    temperature,
  }: {
    system: string;
    prompt: string;
    schema: object;
    images?: string[]; // base64 images, only for models that can see images
    temperature: number; // 0 = always the same answer, 1 = more creative
  }) {
    // Small models sometimes break the JSON, so we try 2 times before giving up.
    for (let attempt = 1; attempt <= 2; attempt++) {
      let response: Response;
      try {
        response = await fetch(`${OLLAMA_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            stream: false, // one full answer instead of word by word
            format: schema, // forces the answer to be JSON in this shape
            options: {
              temperature,
              num_predict: 800, // max length of the answer (in tokens), so it can never run forever
            },
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt, ...(images ? { images } : {}) },
            ],
          }),
        });
      } catch {
        throw new Error(`Cannot reach Ollama at ${OLLAMA_URL}. Start it with: ollama serve`);
      }

      const data = (await response.json().catch(() => null)) as {
        message?: { content?: string };
        error?: string;
      } | null;

      if (!response.ok) {
        // For example: model "gemma3:4b" not found -> it is not downloaded yet
        throw new Error(
          `Ollama: ${data?.error ?? response.status}. Download the model with: ollama pull ${OLLAMA_MODEL}`,
        );
      }

      // Ollama returns the JSON as text inside message.content
      try {
        return JSON.parse(data?.message?.content ?? "") as unknown;
      } catch {
        console.warn(`Ollama answer was not valid JSON (attempt ${attempt} of 2)`);
      }
    }

    throw new Error("The AI gave a broken answer twice. Please try again.");
  }

  // Shorten text to "max" characters without cutting a word in half.
  // "Comfortable Walking Shoes - Shop" (32) -> "Comfortable Walking Shoes -" -> "Comfortable Walking Shoes"
  private static shortenText(value: unknown, max: number) {
    const text = String(value ?? "").trim();
    if (text.length <= max) return text;

    const cut = text.slice(0, max + 1);
    const lastSpace = cut.lastIndexOf(" ");
    const shorter = lastSpace > 0 ? cut.slice(0, lastSpace) : text.slice(0, max);
    // Remove a dash or comma left at the end
    return shorter.replace(/[\s\-–,:;]+$/, "");
  }

  // ==================== Public methods (used by the AI worker) ====================

  // Idea 1: write 3 headlines and 3 descriptions for a product.
  static async suggestAdCopy({ product, audience, tone }: { product: string; audience: string; tone: string }) {
    const answer = (await this.askOllama({
      temperature: 0.8, // creative writing
      system:
        "You are an expert Google Ads copywriter. You write short, clear ad text that makes people click. " +
        "Headlines are at most 30 characters. Descriptions are at most 90 characters. No emojis.",
      prompt:
        `Product: ${product}\nTarget audience: ${audience}\nTone: ${tone}\n\n` +
        "Write 3 different headlines and 3 different descriptions for a Google ad.",
      schema: {
        type: "object",
        properties: {
          headlines: { type: "array", items: { type: "string", maxLength: 40 }, minItems: 3, maxItems: 3 },
          descriptions: { type: "array", items: { type: "string", maxLength: 110 }, minItems: 3, maxItems: 3 },
        },
        required: ["headlines", "descriptions"],
      },
    })) as { headlines?: string[]; descriptions?: string[] };

    // Clean the answer: shorten to Google's limits and skip empty ones.
    const headlines: string[] = [];
    for (const headline of answer.headlines ?? []) {
      const text = this.shortenText(headline, 30);
      if (text) headlines.push(text);
    }

    const descriptions: string[] = [];
    for (const description of answer.descriptions ?? []) {
      const text = this.shortenText(description, 90);
      if (text) descriptions.push(text);
    }

    return { headlines, descriptions };
  }

  // Idea 2: look at the uploaded image and suggest a headline and a description.
  static async describeImage({ imagePath }: { imagePath: string }) {
    // Ollama needs the image as base64 text
    const imageBase64 = fs.readFileSync(imagePath).toString("base64");

    const answer = (await this.askOllama({
      temperature: 0.7,
      system:
        "You are an expert Google Ads copywriter. You look at an ad image and write ad text that fits it. " +
        "Headlines are at most 30 characters. Descriptions are at most 90 characters. No emojis.",
      prompt:
        "Look at this ad image. First say in one short sentence what you see. " +
        "Then write one headline and one description for a Google ad that uses this image.",
      images: [imageBase64],
      schema: {
        type: "object",
        properties: {
          whatISee: { type: "string", maxLength: 200 },
          headline: { type: "string", maxLength: 40 },
          description: { type: "string", maxLength: 110 },
        },
        required: ["whatISee", "headline", "description"],
      },
    })) as { whatISee?: string; headline?: string; description?: string };

    return {
      whatISee: String(answer.whatISee ?? "").trim(),
      headline: this.shortenText(answer.headline, 30),
      description: this.shortenText(answer.description, 90),
    };
  }

  // Idea 3: check the ad text before sending it. Simple rules first (no AI), then the AI review.
  static async reviewAd({ headline, description }: { headline: string; description: string }) {
    // 1. Rule checks: fast, always correct, no AI needed (small AI models are bad at counting letters)
    const ruleIssues: string[] = [];
    if (headline.length > 30) ruleIssues.push(`Headline is ${headline.length} characters (max 30).`);
    if (description.length > 90) ruleIssues.push(`Description is ${description.length} characters (max 90).`);
    if (headline.length > 3 && headline === headline.toUpperCase()) ruleIssues.push("Headline is all CAPS.");
    if (/!{2,}/.test(headline + description)) ruleIssues.push("Do not use more than one ! in a row.");

    // 2. AI review: things rules cannot see (unclear text, misleading claims, typos)
    const answer = (await this.askOllama({
      temperature: 0.3, // reviews should be steady, not creative
      system:
        "You review Google Ads text before it is published. Be honest and short. " +
        "Look for: unclear message, misleading or exaggerated claims, spelling mistakes, weak call to action. " +
        "Do NOT comment on length or character count: the code already checks that. " +
        "The improved version must be about the SAME product. " +
        "Improved headline max 30 characters, improved description max 90 characters.",
      prompt:
        `Headline: ${headline}\nDescription: ${description}\n\n` +
        "Give a score from 1 (bad) to 10 (great), list the problems (max 4), and write an improved version.",
      schema: {
        type: "object",
        properties: {
          score: { type: "integer", minimum: 1, maximum: 10 },
          issues: { type: "array", items: { type: "string", maxLength: 160 }, maxItems: 4 },
          improvedHeadline: { type: "string", maxLength: 40 },
          improvedDescription: { type: "string", maxLength: 110 },
        },
        required: ["score", "issues", "improvedHeadline", "improvedDescription"],
      },
    })) as { score?: number; issues?: string[]; improvedHeadline?: string; improvedDescription?: string };

    // Keep the score between 1 and 10
    const score = Math.min(10, Math.max(1, Math.round(Number(answer.score) || 1)));

    return {
      // Approved only when no rule is broken and the AI gives 7 or more
      approved: ruleIssues.length === 0 && score >= 7,
      score,
      ruleIssues,
      aiIssues: (answer.issues ?? []).map((issue) => String(issue).trim()).filter((issue) => issue !== ""),
      improvedHeadline: this.shortenText(answer.improvedHeadline, 30),
      improvedDescription: this.shortenText(answer.improvedDescription, 90),
    };
  }

  // Idea 4: explain the Google Ads campaigns in plain words and give tips.
  static async summarizeCampaigns({
    campaigns,
  }: {
    campaigns: { name: string; status: string; channel: string; dailyBudget: number }[];
  }) {
    // No campaigns: nothing to ask the AI
    if (campaigns.length === 0) {
      return { summary: "You have no Google Ads campaigns yet.", tips: ["Create your first campaign to get started."] };
    }

    // Numbers are counted by code, not by the AI (AI can make mistakes with math)
    let totalDailyBudget = 0;
    let pausedCount = 0;
    for (const campaign of campaigns) {
      totalDailyBudget += campaign.dailyBudget;
      if (campaign.status === "PAUSED") pausedCount += 1;
    }

    const answer = (await this.askOllama({
      temperature: 0.4,
      system:
        "You are a friendly Google Ads assistant. You explain campaigns in plain, simple English for beginners. " +
        "Use the numbers you are given; do not invent numbers. Money is in EUR. No markdown.",
      prompt:
        `Total campaigns: ${campaigns.length}\nPaused campaigns: ${pausedCount}\n` +
        `Total daily budget: ${totalDailyBudget.toFixed(2)} EUR\n\nCampaigns:\n${JSON.stringify(campaigns, null, 2)}\n\n` +
        "Write a summary in 2-3 sentences and give 3 short, practical tips.",
      schema: {
        type: "object",
        properties: {
          summary: { type: "string", maxLength: 500 },
          tips: { type: "array", items: { type: "string", maxLength: 200 }, minItems: 3, maxItems: 3 },
        },
        required: ["summary", "tips"],
      },
    })) as { summary?: string; tips?: string[] };

    return {
      summary: String(answer.summary ?? "").trim(),
      // Remove markdown stars like **Check budgets:** that small models like to add
      tips: (answer.tips ?? []).map((tip) => String(tip).replace(/\*\*/g, "").trim()).filter((tip) => tip !== ""),
      totals: { campaigns: campaigns.length, paused: pausedCount, dailyBudget: totalDailyBudget },
    };
  }
}

export default AiService;
