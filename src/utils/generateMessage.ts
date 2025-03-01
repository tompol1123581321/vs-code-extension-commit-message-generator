import * as vscode from "vscode";
import {
  DEFAULT_SETTINGS_PATH,
  DEFAULT_TEMPLATE,
  TEMPLATE,
} from "../constants";

export function fillTemplate(
  template: string,
  branchPartsData: string[],
  message: string
): string {
  let result = template.replace(/\{message\}/g, message.trim());
  result = result.replace(
    /(\{+)(b(\d+))(\}+)/g,
    (_, openBraces, __, num, closeBraces) => {
      const index = parseInt(num, 10) - 1;
      const part = branchPartsData[index];

      if (openBraces.length === 1 && closeBraces.length === 1) {
        return part !== undefined ? part : `{b${num}}`;
      }
      return `{${part ?? `b${num}`}}`;
    }
  );
  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isMessageCompatible(message: string): boolean {
  const config = vscode.workspace.getConfiguration(DEFAULT_SETTINGS_PATH);
  const template = config.get<string>(TEMPLATE, DEFAULT_TEMPLATE);

  let pattern = escapeRegex(template);

  pattern = pattern.replace(/\\\{b\d+\\\}/g, "(.+?)");
  pattern = pattern.replace(/\\\{message\\\}/g, "([\\s\\S]+?)");
  pattern = "^" + pattern + "$";
  const regex = new RegExp(pattern, "m");
  return regex.test(message.trim());
}

export const generateMessage = (
  branchPartsData: string[],
  message: string
): string => {
  const trimmed = message.trim();

  if (isMessageCompatible(trimmed)) {
    return message;
  }

  const config = vscode.workspace.getConfiguration(DEFAULT_SETTINGS_PATH);
  const template = config.get<string>(TEMPLATE, DEFAULT_TEMPLATE);

  return fillTemplate(template, branchPartsData, trimmed);
};
