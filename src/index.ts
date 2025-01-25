import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { authRouter } from "./routes/auth";
import { quickLinkRouter } from "./routes/quicklink";

const app = new Hono();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);

// Routes
app.route("/api/auth", authRouter);
app.route("/api/quick-links", quickLinkRouter);

// Start server
const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
