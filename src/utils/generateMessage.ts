import { BranchData } from "./types";

export const generateMessage = (
  branchData: BranchData,
  message: string
): string => {
  const prefix = `${branchData.type}(${branchData.context}):`;
  const suffix = `[${branchData.ticketId}]`;
  const trimmedMessage = message.trim();
  if (trimmedMessage.startsWith(prefix) && trimmedMessage.endsWith(suffix)) {
    return message;
  }
  return `${prefix}
${message}

${suffix}`;
};
