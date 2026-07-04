# Daily Social Post MCP Server

TypeScript MCP server that generates daily social media posts, post images, and 30-day content calendars with OpenAI.

## Tools

### `generate_daily_post`

Inputs:

- `business_name`
- `niche`
- `target_audience`
- `tone`
- `platform`
- `offer_or_topic`

Output:

- `caption`
- `hashtags`
- `call_to_action`
- `image_prompt`

### `generate_post_image`

Inputs:

- `image_prompt`
- `brand_colors`
- `style`

Output:

- `generated_image_url`

By default this returns a `data:image/png;base64,...` URL so the server does not need object storage.

### `generate_30_day_calendar`

Inputs:

- `business_name`
- `niche`
- `target_audience`
- `platform`
- `goal`

Output:

- 30 daily post ideas
- captions
- hashtags
- image prompts

## Setup

```bash
npm install
cp .env.example .env
```

Add your provider key to `.env`.

## Provider options

### OpenAI for text and images

```bash
AI_TEXT_PROVIDER=openai
AI_IMAGE_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_TEXT_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-1
```

### OpenRouter for text, Gemini for images

OpenRouter is OpenAI-compatible for chat/text generation. Use Gemini or OpenAI for `generate_post_image`.

```bash
AI_TEXT_PROVIDER=openrouter
AI_IMAGE_PROVIDER=gemini
OPENROUTER_API_KEY=sk-or-your-openrouter-api-key
OPENROUTER_TEXT_MODEL=openai/gpt-4.1-mini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
PUBLIC_BASE_URL=https://your-render-app.onrender.com
```

### Gemini for text and images

```bash
AI_TEXT_PROVIDER=gemini
AI_IMAGE_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_TEXT_MODEL=gemini-3.5-flash
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
PUBLIC_BASE_URL=https://your-render-app.onrender.com
```

## Local MCP usage over stdio

Set:

```bash
MCP_TRANSPORT=stdio
```

Build and run:

```bash
npm run build
npm start
```

Example MCP client config:

```json
{
  "mcpServers": {
    "daily-social-post-generator": {
      "command": "node",
      "args": ["C:/path/to/daily-social-post-mcp-server/dist/index.js"],
      "env": {
        "AI_TEXT_PROVIDER": "openai",
        "AI_IMAGE_PROVIDER": "openai",
        "OPENAI_API_KEY": "sk-your-openai-api-key",
        "MCP_TRANSPORT": "stdio"
      }
    }
  }
}
```

## HTTP mode for Railway or Render

Set:

```bash
MCP_TRANSPORT=http
PORT=3000
```

The MCP endpoint is:

```text
POST /mcp
```

Health check:

```text
GET /
```

## Deploy on Railway

1. Create a new Railway project from this repo.
2. Add environment variables:
   - provider key, such as `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, or `GEMINI_API_KEY`
   - `AI_TEXT_PROVIDER`
   - `AI_IMAGE_PROVIDER`
   - `MCP_TRANSPORT=http`
   - model variables for your chosen provider
3. Set build command:

```bash
npm install && npm run build
```

4. Set start command:

```bash
npm start
```

Railway provides `PORT`; this server reads it automatically.

## Deploy on Render

1. Create a new Web Service from this repo.
2. Use Node 20 or newer.
3. Add the same environment variables as above.
4. Build command:

```bash
npm install && npm run build
```

5. Start command:

```bash
npm start
```

## Notes

- Text generation uses `AI_TEXT_PROVIDER` and the matching model variable.
- Image generation uses `AI_IMAGE_PROVIDER` and the matching image model variable.
- When `PUBLIC_BASE_URL` is set, `generate_post_image` saves generated images under `/generated` and returns a normal public image URL.
- Without `PUBLIC_BASE_URL`, `generate_post_image` returns a base64 data URL.
- Render's filesystem is ephemeral, so generated image URLs may disappear after restarts or redeploys. For permanent image hosting, add S3, Cloudflare R2, or another object store.
