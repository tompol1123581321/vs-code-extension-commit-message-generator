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

  const generateCommand = vscode.commands.registerCommand(
    "commit-message-structure-generator.generateMessage",
    async () => {
      git.repositories.forEach((repo: Repo) => {
        repo.inputBox.value = "Generating commit message...";
        (repo.inputBox as any).disabled = true;
      });

      await vscode.commands.executeCommand(
        "github.copilot.git.generateCommitMessage"
      );

      const interval = setInterval(() => {
        let allReposUpdated = true;
        git.repositories.forEach((repo: Repo) => {
          if (repo.inputBox.value === "Generating commit message...") {
            allReposUpdated = false;
          } else {
            updateCommitMessageFieldWithMsg(repo, repo.inputBox.value);
            if ((repo.inputBox as any).disabled) {
              (repo.inputBox as any).disabled = false;
            }
          }
        });
        if (allReposUpdated) {
          clearInterval(interval);
        }
      }, 200);
    }
  );
  context.subscriptions.push(generateCommand);

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
