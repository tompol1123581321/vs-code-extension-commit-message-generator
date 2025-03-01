import { BranchData } from "./types";

export const extractInfoFromCurrentBranch = (
  branchName: string
): BranchData => {
  const parts = branchName.split("-");

  // Extract parts with defaults if missing.
  let ticketId = parts[1] || "ticketId";
  let type = parts[2] || "type";
  let context = parts[3] || "context";

  if (isNaN(Number(ticketId))) {
    ticketId = "ticketId";
  }

  if (type !== "feat" && type !== "fix") {
    type = "type";
  }

  return { ticketId, type, context };
};
