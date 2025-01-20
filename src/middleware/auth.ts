// import { Context, Next } from "hono";
// import { auth } from "../auth";

// export async function requireAuth(c: Context, next: Next) {
//   try {
//     const session = await auth.api.getSession({
//       headers: c.req.header(),
//     });

//     if (!session) {
//       return c.json(
//         {
//           success: false,
//           error: "Unauthorized",
//         },
//         401,
//       );
//     }

//     c.set("user", session.user);
//     await next();
//   } catch (error) {
//     return c.json(
//       {
//         success: false,
//         error: "Unauthorized",
//       },
//       401,
//     );
//   }
// }
