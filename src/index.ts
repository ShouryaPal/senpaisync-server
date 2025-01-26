import { Hono } from "hono";
import { auth } from "./auth";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { CheckEmailBody } from "./type";
import prisma from "./prisma";
import { quickLinkRouter } from "./routes/quicklink";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const checkEmailSchema = z.object({
  email: z.string().email(),
});

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

app.post(
  "/api/check-email",
  zValidator("json", checkEmailSchema),
  async (c) => {
    try {
      const { email } = await c.req.json<CheckEmailBody>();

      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
        },
      });

      return c.json({
        success: true,
        exists: !!user,
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            error: error.message,
          },
          400,
        );
      }
      return c.json(
        {
          success: false,
          error: "An unknown error occurred",
        },
        500,
      );
    }
  },
);

app.get("/session", async (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) return c.body(null, 401);

  return c.json({
    session,
    user,
  });
});

app.route("/api/quick-links", quickLinkRouter);

// Start server
const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
