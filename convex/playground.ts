import { definePlaygroundAPI } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { agent } from "./threads";

/**
 * Expose the Agent Playground API so the frontend (hosted or local) can access it.
 * Authorization is handled with API keys issued via:
 * npx convex run --component agent apiKeys:issue '{name:"local-dev"}'
 */
export const {
  isApiKeyValid,
  listAgents,
  listUsers,
  listThreads,
  listMessages,
  createThread,
  generateText,
  fetchPromptContext,
} = definePlaygroundAPI(components.agent, {
  agents: [agent],
});
