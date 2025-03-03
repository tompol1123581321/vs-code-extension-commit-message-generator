import * as vscode from "vscode";
import { extractInfoFromCurrentBranch } from "./extractInfoFromCurrentBranch";
import { generateMessage } from "./generateMessage";
import { Repo } from "./types";

/**
 * Triggers Copilot to generate a commit message for the given repository,
 * then polls until the commit input is updated (i.e. differs from our placeholder).
 * Once updated, it applies our template logic and returns the generated message.
 *
 * @param repo The repository to generate the message for.
 * @returns A Promise that resolves to the generated commit message string.
 */
export async function generateCommitMessageFromCopilotForRepo(
  repo: Repo
): Promise<string> {
  // Trigger Copilot to generate a commit message.
  await vscode.commands.executeCommand(
    "github.copilot.git.generateCommitMessage"
  );

  const pollInterval = 100; // in ms
  const timeout = 5000; // in ms
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      // Check if the input has been updated from our placeholder.
      if (repo.inputBox.value !== "Generating commit message...") {
        clearInterval(interval);
        const branchName = repo.state.HEAD?.name;
        if (branchName) {
          const { branchPartsData } = extractInfoFromCurrentBranch(branchName);
          const currentMessage = repo.inputBox.value;
          const newMessage = generateMessage(branchPartsData, currentMessage);
          // Re-enable the field if it was marked as disabled.
          if ((repo.inputBox as any).disabled) {
            (repo.inputBox as any).disabled = false;
          }
          resolve(newMessage);
        } else {
          reject(new Error("No branch found."));
        }
      }
      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        // Re-enable the field in case of timeout.
        if ((repo.inputBox as any).disabled) {
          (repo.inputBox as any).disabled = false;
        }
        reject(new Error("Timeout waiting for Copilot output."));
      }
    }, pollInterval);
  });
}
