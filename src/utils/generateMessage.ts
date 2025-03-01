import * as vscode from "vscode";

export const fillTemplate = (
  template: string,
  branchPartsData: string[],
  message: string
): string => {
  let result = template.replace(/\{message\}/g, message.trim());

  // For each {bN} or {{bN}} / {{{bN}}} placeholders:
  result = result.replace(
    /(\{+)(b(\d+))(\}+)/g,
    (_, openBraces, __, num, closeBraces) => {
      const index = parseInt(num, 10) - 1;
      const part = branchPartsData[index]; // e.g. branchPartsData[3] if b4

      // Single braces => direct substitution or keep placeholder if missing
      if (openBraces.length === 1 && closeBraces.length === 1) {
        return part !== undefined ? part : `{b${num}}`;
      }

      // Double or triple braces => we want literal braces around the replaced text
      // If the part is missing, keep it as {bN} inside the braces.
      return `{${part ?? `b${num}`}}`;
    }
  );

  return result;
};

export const generateMessage = (
  branchPartsData: string[],
  message: string
): string => {
  const config = vscode.workspace.getConfiguration("commitMessageStructure");
  const template = config.get<string>(
    "template",
    "{b1}({b2}):\n{message}\n\n[{b3}]"
  );

  // Split once around {message} to build prefix/suffix for "already structured" check
  const parts = template.split("{message}");
  let prefix = "";
  let suffix = "";

  if (parts.length === 2) {
    prefix = fillTemplate(parts[0], branchPartsData, "");
    suffix = fillTemplate(parts[1], branchPartsData, "");
  }

  const trimmedMessage = message.trim();

  // If the current commit message already matches the prefix/suffix from the template
  if (
    trimmedMessage.startsWith(prefix.trim()) &&
    trimmedMessage.endsWith(suffix.trim())
  ) {
    // Return it unchanged
    return message;
  }

  // Otherwise, fill the template with the new message
  const filledTemplate = fillTemplate(
    template,
    branchPartsData,
    trimmedMessage
  );
  return filledTemplate;
};
