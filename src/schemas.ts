import { z } from "zod";

export const dailyPostInputSchema = {
  business_name: z.string().min(1).describe("Business or brand name."),
  niche: z.string().min(1).describe("Industry, category, or specialty."),
  target_audience: z.string().min(1).describe("Who the post should speak to."),
  tone: z.string().min(1).describe("Desired voice, e.g. friendly, bold, luxury, playful."),
  platform: z.string().min(1).describe("Social platform, e.g. Instagram, LinkedIn, TikTok."),
  offer_or_topic: z.string().min(1).describe("Offer, campaign, product, tip, or topic for the post.")
};

export const postImageInputSchema = {
  image_prompt: z.string().min(1).describe("Prompt describing the desired social media image."),
  brand_colors: z.string().min(1).describe("Brand colors as names, hex values, or a short palette description."),
  style: z.string().min(1).describe("Visual style, e.g. minimalist, editorial, photorealistic, flat illustration.")
};

export const calendarInputSchema = {
  business_name: z.string().min(1).describe("Business or brand name."),
  niche: z.string().min(1).describe("Industry, category, or specialty."),
  target_audience: z.string().min(1).describe("Who the calendar should speak to."),
  platform: z.string().min(1).describe("Social platform, e.g. Instagram, LinkedIn, TikTok."),
  goal: z.string().min(1).describe("Marketing goal, e.g. leads, awareness, bookings, product sales.")
};

export const dailyPostOutputSchema = z.object({
  caption: z.string(),
  hashtags: z.array(z.string()).min(1),
  call_to_action: z.string(),
  image_prompt: z.string()
});

export const calendarOutputSchema = z.object({
  posts: z.array(
    z.object({
      day: z.number().int().min(1).max(30),
      post_idea: z.string(),
      caption: z.string(),
      hashtags: z.array(z.string()).min(1),
      image_prompt: z.string()
    })
  ).length(30)
});

export type DailyPostOutput = z.infer<typeof dailyPostOutputSchema>;
export type CalendarOutput = z.infer<typeof calendarOutputSchema>;
