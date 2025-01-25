import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { auth } from "../auth";
import prisma from "../prisma";
import { requireAuth } from "../middleware/auth";

const quickLinkRouter = new Hono();

const quickLinkSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
});

quickLinkRouter.post(
  "/",
  requireAuth,
  zValidator("json", quickLinkSchema),
  async (c) => {
    try {
      const { name, url } = await c.req.json();
      const user = c.get("user");

      const quickLink = await prisma.quickLink.create({
        data: {
          name,
          url,
          userId: user.id,
        },
      });

      return c.json({
        success: true,
        quickLink,
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

// Get All Quick Links for the User
quickLinkRouter.get("/", requireAuth, async (c) => {
  try {
    const user = c.get("user");

    const quickLinks = await prisma.quickLink.findMany({
      where: {
        userId: user.id,
      },
    });

    return c.json({
      success: true,
      quickLinks,
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
});

// Update Quick Link
quickLinkRouter.put("/:id", requireAuth, async (c) => {
  try {
    const { id } = c.req.param();
    const { name, url } = await c.req.json();
    const user = c.get("user");

    const quickLink = await prisma.quickLink.update({
      where: {
        id,
        userId: user.id, // Ensure the user owns the Quick Link
      },
      data: {
        name,
        url,
      },
    });

    return c.json({
      success: true,
      quickLink,
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
});

// Delete Quick Link
quickLinkRouter.delete("/:id", requireAuth, async (c) => {
  try {
    const { id } = c.req.param();
    const user = c.get("user");

    await prisma.quickLink.delete({
      where: {
        id,
        userId: user.id, // Ensure the user owns the Quick Link
      },
    });

    return c.json({
      success: true,
      message: "Quick Link deleted successfully",
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
});

export { quickLinkRouter };
