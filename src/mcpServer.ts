import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  calendarInputSchema,
  dailyPostInputSchema,
  postImageInputSchema
} from "./schemas.js";
import {
  generateCalendarText,
  generateDailyPostText,
  generateImageUrl
} from "./openaiClient.js";

function jsonContent(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

export function createSocialPostMcpServer() {
  const server = new McpServer({
    name: "daily-social-post-generator",
    version: "1.0.0"
  });

  server.tool(
    "generate_daily_post",
    "Generate a ready-to-publish social media caption, hashtags, CTA, and image prompt.",
    dailyPostInputSchema,
    async (input) => jsonContent(await generateDailyPostText(input))
  );

  server.tool(
    "generate_post_image",
    "Generate a social media image from an image prompt, brand colors, and style.",
    postImageInputSchema,
    async (input) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              generated_image_url: await generateImageUrl(input)
            },
            null,
            2
          )
        }
      ]
    })
  );

  server.tool(
    "generate_30_day_calendar",
    "Generate a 30-day content calendar with daily ideas, captions, hashtags, and image prompts.",
    calendarInputSchema,
    async (input) => jsonContent(await generateCalendarText(input))
  );

  return server;
}
