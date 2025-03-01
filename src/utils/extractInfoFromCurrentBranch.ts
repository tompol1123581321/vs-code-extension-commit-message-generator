import * as vscode from "vscode";
import { BranchData } from "./types";

export const extractInfoFromCurrentBranch = (branchName: string) => {
  const config = vscode.workspace.getConfiguration("commitMessageStructure");
  const separator = config.get<string>("wordSeparator", "-");
  const branchPartsData = branchName.split(separator);

  return { branchPartsData };
};
