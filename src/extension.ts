import * as vscode from "vscode";
import { extractInfoFromCurrentBranch } from "./utils/extractInfoFromCurrentBranch";
import { generateMessage } from "./utils/generateMessage";
import { getGitAPI } from "./utils/getGitApi";
import { Repo } from "./utils/types";

const updateCommitMessageField = (repo: Repo) => {
  const branchName = repo.state.HEAD?.name;
  if (branchName) {
    const { branchPartsData } = extractInfoFromCurrentBranch(branchName);
    const currentMessage = repo.inputBox.value;
    const newMessage = generateMessage(branchPartsData, currentMessage);
    if (currentMessage !== newMessage) {
      repo.inputBox.value = newMessage;
    }
  }
};

export async function activate(context: vscode.ExtensionContext) {
  console.log(
    "Congratulations, your extension DEFAULT_SETTINGS_PATH is now active!"
  );

  const git = await getGitAPI();
  if (!git) {
    return;
  }

  git.repositories.forEach((repo: Repo) => {
    repo.state.onDidChange(() => {
      updateCommitMessageField(repo);
    });
    let debounceTimer: NodeJS.Timeout | undefined;
    if (repo.inputBox && typeof repo.inputBox.onDidChange === "function") {
      repo.inputBox.onDidChange(() => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
          updateCommitMessageField(repo);
        }, 1000);
      });
    }
  });
}

export function deactivate() {}
