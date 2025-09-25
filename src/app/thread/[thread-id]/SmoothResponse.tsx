import { useSmoothText } from "@convex-dev/agent/react";
import { Response } from "@/components/ai-elements/response";

const SmoothResponse = ({ text }: { text: string }) => {
  const [visibleText] = useSmoothText(text);
  return visibleText;
};

export default SmoothResponse;
