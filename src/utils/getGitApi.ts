import * as vscode from "vscode";

export const getGitAPI = async () => {
  const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
  if (!gitExtension) {
    vscode.window.showErrorMessage("Git extension not found");
    return undefined;
  }

  return gitExtension.getAPI(1);
};
