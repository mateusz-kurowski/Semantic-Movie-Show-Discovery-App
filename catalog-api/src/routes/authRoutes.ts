import Elysia, { t } from "elysia";
import { auth } from "../auth";

const authRoutes = new Elysia({ name: "auth", prefix: "/auth" })
  .post(
    "/signup",
    async ({ body }) => {
      // Handle signup logic here
      await auth.api.signUpEmail();
      return { message: "Signup successful" };
    },
    {
      body: t.Object({
        password: t.String(),
        email: t.String(),
      }),
    },
  )
  .post("/login", async ({ body }) => {
    // Handle login logic here
    return { message: "Login successful" };
  })
  .post("/logout", async ({ body }) => {
    // Handle logout logic here
    return { message: "Logout successful" };
  });

export default authRoutes;
