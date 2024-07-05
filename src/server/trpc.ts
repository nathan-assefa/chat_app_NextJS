import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();

// Let's define the middleware for the private routes
const middleware = t.middleware;

const isAuth = middleware(async (opts) => {
  const session = getKindeServerSession();
  const user = session ? await session.getUser() : null;

  if (!user || !user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  });
});
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

// since we tell the router to use the 'isAuth' middleware,
// it'll will call the middleware anytime it is called
export const privateProcedure = t.procedure.use(isAuth);
