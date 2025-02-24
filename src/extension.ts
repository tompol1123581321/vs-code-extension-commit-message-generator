import * as vscode from "vscode";
import { extractInfoFromCurrentBranch } from "./utils/extractInfoFromCurrentBranch";
import { generateMessage } from "./utils/generateMessage";
import { getGitAPI } from "./utils/getGitApi";
import { Repo } from "./utils/types";

const updateCommitMessageField = (repo: Repo) => {
  const branchName = repo.state.HEAD?.name;
  if (branchName) {
    const branchData = extractInfoFromCurrentBranch(branchName);
    const currentMessage = repo.inputBox.value;
    const newMessage = generateMessage(branchData, currentMessage);
    if (currentMessage !== newMessage) {
      vscode.window.setStatusBarMessage(
        `Updating commit message field: ${newMessage}`,
        3000
      );
      repo.inputBox.value = newMessage;
    }
  }
};

export async function activate(context: vscode.ExtensionContext) {
  vscode.window.setStatusBarMessage(
    'Extension "commit-message-structure-generator" activated!',
    3000
  );
  const git = await getGitAPI();
  if (!git) {
    vscode.window.setStatusBarMessage("Git API not found.", 3000);
    return;
  }

  git.repositories.forEach((repo: Repo) => {
    repo.state.onDidChange(() => {
      vscode.window.setStatusBarMessage("Repository state changed.", 3000);
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
