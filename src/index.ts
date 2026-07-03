#!/usr/bin/env node
import express from "express";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { config } from "./config.js";
import { createSocialPostMcpServer } from "./mcpServer.js";
import {
  generateCalendarText,
  generateDailyPostText,
  generateImageUrl
} from "./openaiClient.js";

async function startStdio() {
  const server = createSocialPostMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function startHttp() {
  const app = express();
  app.use(express.json({ limit: "20mb" }));
  app.use(express.static("public"));

  app.get("/health", (_req, res) => {
    res.json({
      name: "daily-social-post-generator",
      status: "ok",
      mcp_endpoint: "/mcp"
    });
  });

  app.post("/api/daily-post", async (req, res, next) => {
    try {
      res.json(await generateDailyPostText(req.body));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/calendar", async (req, res, next) => {
    try {
      res.json(await generateCalendarText(req.body));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/image", async (req, res, next) => {
    try {
      res.json({
        generated_image_url: await generateImageUrl(req.body)
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/mcp", async (req, res) => {
    const server = createSocialPostMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined
    });

    res.on("close", () => {
      transport.close().catch(() => undefined);
      server.close().catch(() => undefined);
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({
      error: error.message
    });
  });

  app.listen(config.PORT, () => {
    console.error(`MCP HTTP server listening on port ${config.PORT}`);
  });
}

if (config.MCP_TRANSPORT === "http") {
  await startHttp();
} else {
  await startStdio();
}
