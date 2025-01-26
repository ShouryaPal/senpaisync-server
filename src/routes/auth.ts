import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { auth } from "../auth";
import type {
  SignUpBody,
  SignInBody,
  UpdatePasswordBody,
  CheckEmailBody,
} from "../type";
import prisma from "../prisma";

const authRouter = new Hono();

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string(),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const checkEmailSchema = z.object({
  email: z.string().email(),
});

authRouter.post("/signup", zValidator("json", signUpSchema), async (c) => {
  try {
    const { email, password, name } = await c.req.json<SignUpBody>();

    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    return c.json({
      success: true,
      user,
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

// Sign in route
authRouter.post("/signin", zValidator("json", signInSchema), async (c) => {
  try {
    const { email, password } = await c.req.json<SignInBody>();

    const session = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return c.json({
      success: true,
      session,
    });
    console.log("user signin successfull");
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        401,
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

authRouter.post(
  "/check-email",
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

authRouter.get("/session", async (c) => {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return c.json({ success: false, error: "Missing token" }, 401);
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return c.json({ success: false, error: "Invalid session" }, 401);
    }

    console.log(session.token, session.user);
    return c.json({
      success: true,
      session: {
        token: session.token,
        user: session.user,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return c.json({ success: false, error: "Server error" }, 500);
  }
});

// // Sign out route
// authRouter.post("/signout", async (c) => {
//   try {
//     await auth.api.signOut({
//       headers: c.req.header(),
//     });

//     return c.json({
//       success: true,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       return c.json(
//         {
//           success: false,
//           error: error.message,
//         },
//         400,
//       );
//     }
//     return c.json(
//       {
//         success: false,
//         error: "An unknown error occurred",
//       },
//       500,
//     );
//   }
// });

export { authRouter };
