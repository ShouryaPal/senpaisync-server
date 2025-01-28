import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "../prisma";

// Define types for the router
type Variables = {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
};

// Create router with typed variables
const quickLinkRouter = new Hono<{
  Variables: Variables;
}>();

// Validation schemas
const quickLinkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Invalid URL format"),
});

const updateQuickLinkSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  url: z.string().url("Invalid URL format").optional(),
});

// Create Quick Link
quickLinkRouter.post("/", zValidator("json", quickLinkSchema), async (c) => {
  try {
    const user = c.get("user");
    if (!user || !user.id) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
        },
        401,
      );
    }

    const { name, url } = await c.req.json();

    const quickLink = await prisma.quickLink.create({
      data: {
        name,
        url,
        userId: user.id,
      },
    });

    return c.json({
      success: true,
      data: quickLink,
    });
  } catch (error) {
    console.error("Error creating quick link:", error);
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

// Get All Quick Links
quickLinkRouter.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user || !user.id) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
        },
        401,
      );
    }

    const quickLinks = await prisma.quickLink.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      success: true,
      data: quickLinks,
    });
  } catch (error) {
    console.error("Error fetching quick links:", error);
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

// Get Single Quick Link
quickLinkRouter.get("/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user || !user.id) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
        },
        401,
      );
    }

    const { id } = c.req.param();

    const quickLink = await prisma.quickLink.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!quickLink) {
      return c.json(
        {
          success: false,
          error: "Quick link not found",
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: quickLink,
    });
  } catch (error) {
    console.error("Error fetching quick link:", error);
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
quickLinkRouter.put(
  "/:id",
  zValidator("json", updateQuickLinkSchema),
  async (c) => {
    try {
      const user = c.get("user");
      if (!user || !user.id) {
        return c.json(
          {
            success: false,
            error: "Unauthorized",
          },
          401,
        );
      }

      const { id } = c.req.param();
      const updateData = await c.req.json();

      // Check if the quick link exists and belongs to the user
      const existingQuickLink = await prisma.quickLink.findUnique({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!existingQuickLink) {
        return c.json(
          {
            success: false,
            error: "Quick link not found",
          },
          404,
        );
      }

      const updatedQuickLink = await prisma.quickLink.update({
        where: {
          id,
          userId: user.id,
        },
        data: updateData,
      });

      return c.json({
        success: true,
        data: updatedQuickLink,
      });
    } catch (error) {
      console.error("Error updating quick link:", error);
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

// Delete Quick Link
quickLinkRouter.delete("/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user || !user.id) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
        },
        401,
      );
    }

    const { id } = c.req.param();

    // Check if the quick link exists and belongs to the user
    const existingQuickLink = await prisma.quickLink.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingQuickLink) {
      return c.json(
        {
          success: false,
          error: "Quick link not found",
        },
        404,
      );
    }

    await prisma.quickLink.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return c.json({
      success: true,
      message: "Quick link deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quick link:", error);
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
