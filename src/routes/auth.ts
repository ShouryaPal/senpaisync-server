import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { auth } from "../auth";
import type { SignUpBody, SignInBody, UpdatePasswordBody } from "../type";

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

// Get session route
// authRouter.get("/session", async (c) => {
//   try {
//     const session = await auth.api.getSession({
//       headers: c.req.header(),
//     });

//     return c.json({
//       success: true,
//       session,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       return c.json(
//         {
//           success: false,
//           error: error.message,
//         },
//         401,
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
