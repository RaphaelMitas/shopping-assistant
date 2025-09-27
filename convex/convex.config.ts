import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import resend from "@convex-dev/resend/convex.config";
import autumn from "@useautumn/convex/convex.config";
import agent from "@convex-dev/agent/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(resend);
app.use(autumn);
app.use(agent);
app.use(rateLimiter);

export default app;
