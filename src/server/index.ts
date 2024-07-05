import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

// Creating appRouter instance
export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const session = getKindeServerSession();

    const user = session ? await session.getUser() : null;

    if (!user?.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

    // Check if the user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      // create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId, user } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),
  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Let's first get the current user ID.
      // Remember: the user ID is passed from the middleware
      const { userId } = ctx;

      // Here we check if the file, the user trying to delete, exist
      const file = db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      // If the file not exist, we throw error
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      // If the file exist, we remove it
      await db.file.delete({
        where: {
          id: input.id,
        },
      });

      return file;
    }),
});

export type AppRouter = typeof appRouter;
