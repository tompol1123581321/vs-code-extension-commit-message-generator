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

  // Register a command to generate the commit message using Copilot's output.
  const generateCommand = vscode.commands.registerCommand(
    "commit-message-structure-generator.generateMessage",
    async () => {
      // For each repository, simulate disabling the commit message field.
      git.repositories.forEach((repo: Repo) => {
        // Simulate disable by setting a placeholder text.
        repo.inputBox.value = "Generating commit message...";
        // Optionally, mark the inputBox as disabled with a custom flag.
        (repo.inputBox as any).disabled = true;
      });

      // Trigger Copilot to generate a commit message.
      await vscode.commands.executeCommand(
        "github.copilot.git.generateCommitMessage"
      );

      // Start fast polling interval to check when Copilot has updated the field.
      const interval = setInterval(() => {
        let allReposUpdated = true;
        git.repositories.forEach((repo: Repo) => {
          // If the field value is still our placeholder, Copilot hasn't updated it.
          if (repo.inputBox.value === "Generating commit message...") {
            allReposUpdated = false;
          } else {
            // Once changed, update the commit message with our formatting logic.
            updateCommitMessageFieldWithMsg(repo, repo.inputBox.value);
            // "Re-enable" the input field by removing our custom flag.
            if ((repo.inputBox as any).disabled) {
              (repo.inputBox as any).disabled = false;
            }
          }
        });
        // When all repositories have updated values, stop polling.
        if (allReposUpdated) {
          clearInterval(interval);
        }
      }, 200);
    }
  );
  context.subscriptions.push(generateCommand);

  // Listen for branch changes (only trigger on branch name change)
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
