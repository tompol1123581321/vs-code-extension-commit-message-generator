import * as vscode from "vscode";
import { getGitAPI } from "./utils/getGitApi";
import { Repo } from "./utils/types";
import { extractInfoFromCurrentBranch } from "./utils/extractInfoFromCurrentBranch";
import { generateMessage } from "./utils/generateMessage";
import { generateCommitMessageFromCopilotForRepo } from "./utils/generateMessageFromCopilot";

const lastBranchMap: Map<Repo, string> = new Map();

const updateCommitMessageFieldWithMsg = (repo: Repo, message: string) => {
  const branchName = repo.state.HEAD?.name;
  if (branchName) {
    const { branchPartsData } = extractInfoFromCurrentBranch(branchName);
    const newMessage = generateMessage(branchPartsData, message);
    vscode.window.showInformationMessage(
      `Updating commit message:\n${newMessage}`
    );
    repo.inputBox.value = newMessage;
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

  const generateBranchCommand = vscode.commands.registerCommand(
    "commit-message-structure-generator.generateBranchMessage",
    () => {
      git.repositories.forEach((repo: Repo) => {
        const branchName = repo.state.HEAD?.name;
        if (branchName) {
          const { branchPartsData } = extractInfoFromCurrentBranch(branchName);
          const currentMessage = repo.inputBox.value;
          const branchGenerated = generateMessage(
            branchPartsData,
            currentMessage
          );
          if (currentMessage !== branchGenerated) {
            updateCommitMessageFieldWithMsg(repo, currentMessage);
          }
        }
      });
    }
  );
  context.subscriptions.push(generateBranchCommand);

  const generateCopilotCommand = vscode.commands.registerCommand(
    "commit-message-structure-generator.generateCopilotMessage",
    async () => {
      let needCopilot = false;
      git.repositories.forEach((repo: Repo) => {
        const branchName = repo.state.HEAD?.name;
        if (branchName) {
          const { branchPartsData } = extractInfoFromCurrentBranch(branchName);
          const currentMessage = repo.inputBox.value;
          const branchGenerated = generateMessage(
            branchPartsData,
            currentMessage
          );
          if (currentMessage !== branchGenerated) {
            needCopilot = true;
          }
        }
      });
      if (!needCopilot) {
        vscode.window.showInformationMessage(
          "No changes detected – using branch-based generation."
        );
        git.repositories.forEach((repo: Repo) => {
          updateCommitMessageFieldWithMsg(repo, repo.inputBox.value);
        });
        return;
      }

      git.repositories.forEach((repo: Repo) => {
        repo.inputBox.value = "Generating commit message...";
        (repo.inputBox as any).disabled = true;
      });

      for (const repo of git.repositories) {
        try {
          const message = await generateCommitMessageFromCopilotForRepo(repo);
          vscode.window.showInformationMessage(
            `Copilot generated message:\n${message}`
          );
          repo.inputBox.value = message;
        } catch (error) {
          vscode.window.showWarningMessage(
            "Copilot did not generate a message."
          );
        }
      }
    }
  );
  context.subscriptions.push(generateCopilotCommand);

  git.repositories.forEach((repo: Repo) => {
    const initialBranch = repo.state.HEAD?.name || "";
    lastBranchMap.set(repo, initialBranch);
    repo.state.onDidChange(() => {
      const currentBranch = repo.state.HEAD?.name;
      if (currentBranch && currentBranch !== lastBranchMap.get(repo)) {
        lastBranchMap.set(repo, currentBranch);
        vscode.window.showInformationMessage(
          `Branch changed to: ${currentBranch}`
        );
      }
    });
  });
}

export function deactivate() {}
