import { useSmoothText } from "@convex-dev/agent/react";

const SmoothResponse = ({ text }: { text: string }) => {
  const [visibleText] = useSmoothText(text);
  return visibleText;
};

export default SmoothResponse;
