import * as vscode from "vscode";

export const extractInfoFromCurrentBranch = (branchName: string) => {
  const config = vscode.workspace.getConfiguration(
    "commit-message-structure-generator"
  );
  const separator = config.get<string>("wordSeparator", "-");
  const branchPartsData = branchName.split(separator);

  return { branchPartsData };
};
