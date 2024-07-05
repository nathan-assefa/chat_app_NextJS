/**
 * - This module exports a React component named Page,
 *   which fetches user information and files related to a user.
 * - using the getKindeServerSession function from the
 *   "@kinde-oss/kinde-auth-nextjs/server" module.
 *
 * @module Page
 */

import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

/**
 * - Represents a React functional component named Page.
 * - This component asynchronously fetches user information
 *   and displays the user's files if available.
 *
 * @returns {JSX.Element}
 */
const Page = async () => {
  // Asynchronously fetches the session object using getKindeServerSession
  // function
  const session = getKindeServerSession();

  // Asynchronously fetches the user object from the session,
  // or assigns null if session is falsy
  const user = session ? await session.getUser() : null;

  if (!user || !user.id) redirect("auth-callback?origin=dashboard");

  // Let's also check if the user data is synced to the database
  const dbUser = db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect("auth-callback?origin=dashboard");

  return (
    <div>
      <Dashboard />
    </div>
  );
};

export default Page; // Exporting the Page component as the default export
