import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { authRouter } from "./routes/auth";
// import { requireAuth } from "./middleware/auth";

const app = new Hono();

// Middleware
app.use(cors());

// Routes
app.route("/api/auth", authRouter);

// app.get("/api/protected", requireAuth, (c) => {
//   const user = c.get("user");
//   return c.json({
//     success: true,
//     message: "Protected data",
//     user,
//   });
// });

// Start server
const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});

export type AppType = typeof app;
