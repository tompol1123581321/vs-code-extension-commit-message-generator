import * as vscode from "vscode";
import {
  DEFAULT_SETTINGS_PATH,
  DEFAULT_WORD_SEPARATOR,
  WORD_SEPARATOR,
} from "../constants";

export const extractInfoFromCurrentBranch = (branchName: string) => {
  const config = vscode.workspace.getConfiguration(DEFAULT_SETTINGS_PATH);
  const separator = config.get<string>(WORD_SEPARATOR, DEFAULT_WORD_SEPARATOR);
  const branchPartsData = branchName.split(separator);

  return { branchPartsData };
};
