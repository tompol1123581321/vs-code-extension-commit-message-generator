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
      vscode.window.showInformationMessage(
        `Updating commit message field:\n${newMessage}`
      );
      repo.inputBox.value = newMessage;
    }
  }
};

export async function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage(
    'Extension "commit-message-structure-generator" activated!'
  );
  const git = await getGitAPI();
  if (!git) {
    vscode.window.showErrorMessage("Git API not found.");
    return;
  }

  git.repositories.forEach((repo: Repo) => {
    repo.state.onDidChange(() => {
      vscode.window.showInformationMessage("Repository state changed.");
      updateCommitMessageField(repo);
    });

    let debounceTimer: NodeJS.Timeout | undefined;
    let lastValue = repo.inputBox.value;
    const pollInterval = setInterval(() => {
      if (repo.inputBox.value !== lastValue) {
        lastValue = repo.inputBox.value;
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
          updateCommitMessageField(repo);
          debounceTimer = undefined;
        }, 1500);
      }
    }, 300);
    context.subscriptions.push({ dispose: () => clearInterval(pollInterval) });
  });
}

export function deactivate() {}
