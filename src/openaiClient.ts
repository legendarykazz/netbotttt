import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { config } from "./config.js";
import {
  calendarOutputSchema,
  dailyPostOutputSchema,
  type CalendarOutput,
  type DailyPostOutput
} from "./schemas.js";

function createTextClient() {
  if (config.AI_TEXT_PROVIDER === "openrouter") {
    return {
      client: new OpenAI({
        apiKey: config.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          ...(config.OPENROUTER_SITE_URL ? { "HTTP-Referer": config.OPENROUTER_SITE_URL } : {}),
          "X-OpenRouter-Title": config.OPENROUTER_SITE_NAME
        }
      }),
      model: config.OPENROUTER_TEXT_MODEL
    };
  }

  if (config.AI_TEXT_PROVIDER === "gemini") {
    return {
      client: new OpenAI({
        apiKey: config.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
      }),
      model: config.GEMINI_TEXT_MODEL
    };
  }

  return {
    client: new OpenAI({
      apiKey: config.OPENAI_API_KEY
    }),
    model: config.OPENAI_TEXT_MODEL
  };
}

function createOpenAiImageClient() {
  return new OpenAI({
    apiKey: config.OPENAI_API_KEY
  });
}

const textClient = createTextClient();

function extractText(response: OpenAI.Chat.Completions.ChatCompletion): string {
  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("OpenAI returned an empty response.");
  }
  return text;
}

function parseJson<T>(text: string, schema: { parse: (value: unknown) => T }): T {
  try {
    return schema.parse(JSON.parse(text));
  } catch (error) {
    throw new Error(`Failed to parse OpenAI JSON response: ${(error as Error).message}`);
  }
}

export async function generateDailyPostText(input: {
  business_name: string;
  niche: string;
  target_audience: string;
  tone: string;
  platform: string;
  offer_or_topic: string;
}): Promise<DailyPostOutput> {
  const response = await textClient.client.chat.completions.create({
    model: textClient.model,
    response_format: { type: "json_object" },
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content:
          "You are a senior social media strategist. Return only valid JSON with keys: caption, hashtags, call_to_action, image_prompt. Hashtags must be an array of strings."
      },
      {
        role: "user",
        content: `Create one high-performing ${input.platform} post.

Business: ${input.business_name}
Niche: ${input.niche}
Target audience: ${input.target_audience}
Tone: ${input.tone}
Offer or topic: ${input.offer_or_topic}

Requirements:
- Caption should be platform-appropriate and ready to publish.
- Include 5 to 12 relevant hashtags.
- CTA should be clear and specific.
- Image prompt should be detailed enough for an image generation model and should not include text overlays unless they are explicitly useful.`
      }
    ]
  });

  return parseJson(extractText(response), dailyPostOutputSchema);
}

export async function generateCalendarText(input: {
  business_name: string;
  niche: string;
  target_audience: string;
  platform: string;
  goal: string;
}): Promise<CalendarOutput> {
  const response = await textClient.client.chat.completions.create({
    model: textClient.model,
    response_format: { type: "json_object" },
    temperature: 0.85,
    messages: [
      {
        role: "system",
        content:
          "You are a social media content strategist. Return only valid JSON with a posts array containing exactly 30 objects. Each object must have day, post_idea, caption, hashtags, and image_prompt."
      },
      {
        role: "user",
        content: `Create a 30-day ${input.platform} content calendar.

Business: ${input.business_name}
Niche: ${input.niche}
Target audience: ${input.target_audience}
Goal: ${input.goal}

Requirements:
- Exactly 30 daily post ideas.
- Captions must be ready to publish.
- Hashtags must be arrays of strings with 5 to 12 tags.
- Image prompts should be specific, brand-safe, and useful for image generation.
- Vary content types across education, proof, engagement, behind-the-scenes, offer, objection-handling, and community.`
      }
    ]
  });

  return parseJson(extractText(response), calendarOutputSchema);
}

export async function generateImageUrl(input: {
  image_prompt: string;
  brand_colors: string;
  style: string;
}): Promise<string> {
  const prompt = `${input.image_prompt}

Brand colors: ${input.brand_colors}
Visual style: ${input.style}
Use a polished social media composition. Avoid unreadable text, distorted logos, watermarks, and clutter.`;

  if (config.AI_IMAGE_PROVIDER === "gemini") {
    if (!config.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required when AI_IMAGE_PROVIDER=gemini.");
    }

    const ai = new GoogleGenAI({
      apiKey: config.GEMINI_API_KEY
    });
    const interaction = await ai.interactions.create({
      model: config.GEMINI_IMAGE_MODEL,
      input: prompt
    });
    const base64 = interaction.output_image?.data;
    if (!base64) {
      throw new Error("Gemini image generation returned no image data.");
    }

    return `data:image/png;base64,${base64}`;
  }

  if (!config.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when AI_IMAGE_PROVIDER=openai.");
  }

  const response = await createOpenAiImageClient().images.generate({
    model: config.OPENAI_IMAGE_MODEL,
    prompt,
    size: "1024x1024",
    n: 1,
    response_format: "b64_json"
  });

  const base64 = response.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error("OpenAI image generation returned no image data.");
  }

  return `data:image/png;base64,${base64}`;
}
