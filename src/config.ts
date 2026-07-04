import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
  AI_TEXT_PROVIDER: z.enum(["openai", "openrouter", "gemini"]).default("openai"),
  AI_IMAGE_PROVIDER: z.enum(["openai", "gemini"]).default("openai"),
  OPENAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_TEXT_MODEL: z.string().default("gpt-4.1-mini"),
  OPENAI_IMAGE_MODEL: z.string().default("gpt-image-1"),
  OPENROUTER_TEXT_MODEL: z.string().default("openai/gpt-4.1-mini"),
  GEMINI_TEXT_MODEL: z.string().default("gemini-3.5-flash"),
  GEMINI_IMAGE_MODEL: z.string().default("gemini-3.1-flash-image"),
  PUBLIC_BASE_URL: z.string().url().optional(),
  OPENROUTER_SITE_URL: z.string().optional(),
  OPENROUTER_SITE_NAME: z.string().default("Daily Social Post MCP Server"),
  MCP_TRANSPORT: z.enum(["stdio", "http"]).default("stdio"),
  PORT: z.coerce.number().int().positive().default(3000)
}).superRefine((value, ctx) => {
  if (value.AI_TEXT_PROVIDER === "openai" && !value.OPENAI_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["OPENAI_API_KEY"],
      message: "OPENAI_API_KEY is required when AI_TEXT_PROVIDER=openai"
    });
  }

  if (value.AI_TEXT_PROVIDER === "openrouter" && !value.OPENROUTER_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["OPENROUTER_API_KEY"],
      message: "OPENROUTER_API_KEY is required when AI_TEXT_PROVIDER=openrouter"
    });
  }

  if (value.AI_TEXT_PROVIDER === "gemini" && !value.GEMINI_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["GEMINI_API_KEY"],
      message: "GEMINI_API_KEY is required when AI_TEXT_PROVIDER=gemini"
    });
  }

  // Image provider keys are checked when generate_post_image is called so text-only
  // deployments can run with only an OpenRouter or Gemini text key.
});

export const config = configSchema.parse(process.env);
