import * as assert from "assert";
import * as vscode from "vscode";
import { extractInfoFromCurrentBranch } from "../utils/extractInfoFromCurrentBranch";
import { generateMessage } from "../utils/generateMessage";

// The extension's "true default" values:
const EXTENSION_DEFAULT_TEMPLATE = "{b1}({b2}):\n{message}\n\n[{b3}]";
const DEFAULT_WORD_SEPARATOR = "-";

suite("Extension Test Suite", function () {
  let config: vscode.WorkspaceConfiguration;
  let userOriginalTemplate: string | undefined;
  let userOriginalSeparator: string | undefined;

  this.beforeAll(async () => {
    // Use the config scope that your extension actually uses:
    config = vscode.workspace.getConfiguration(
      "commit-message-structure-generator"
    );

    // Capture the user’s real current settings:
    userOriginalTemplate = config.get<string>("template");
    userOriginalSeparator = config.get<string>("wordSeparator");

    // Force them to the extension defaults so every test starts from a clean baseline:
    await config.update(
      "template",
      EXTENSION_DEFAULT_TEMPLATE,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      "wordSeparator",
      DEFAULT_WORD_SEPARATOR,
      vscode.ConfigurationTarget.Global
    );
  });

  this.afterAll(async () => {
    // After all tests, restore the user’s original config so we don’t change their environment permanently
    await config.update(
      "template",
      userOriginalTemplate,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      "wordSeparator",
      userOriginalSeparator,
      vscode.ConfigurationTarget.Global
    );
  });

  // For safety, each test also reverts to the extension defaults before and after it runs
  this.beforeEach(async () => {
    await config.update(
      "template",
      EXTENSION_DEFAULT_TEMPLATE,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      "wordSeparator",
      DEFAULT_WORD_SEPARATOR,
      vscode.ConfigurationTarget.Global
    );
  });

  this.afterEach(async () => {
    await config.update(
      "template",
      EXTENSION_DEFAULT_TEMPLATE,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      "wordSeparator",
      DEFAULT_WORD_SEPARATOR,
      vscode.ConfigurationTarget.Global
    );
  });

  vscode.window.showInformationMessage("Start all tests.");

  // --- Tests for extractInfoFromCurrentBranch ---
  test("extractInfoFromCurrentBranch - default separator", () => {
    const branchName = "prefix-123-feat-login";
    const result = extractInfoFromCurrentBranch(branchName);
    assert.deepStrictEqual(result.branchPartsData, [
      "prefix",
      "123",
      "feat",
      "login",
    ]);
  });

  test("extractInfoFromCurrentBranch - custom separator", async () => {
    const originalSeparator = config.get<string>("wordSeparator");

    // Temporarily set a custom separator to "/"
    await config.update(
      "wordSeparator",
      "/",
      vscode.ConfigurationTarget.Global
    );

    const branchName = "prefix/123/feat/login";
    const { branchPartsData } = extractInfoFromCurrentBranch(branchName);
    assert.deepStrictEqual(branchPartsData, ["prefix", "123", "feat", "login"]);

    // Restore the previous separator (though our afterEach also resets to default)
    await config.update(
      "wordSeparator",
      originalSeparator,
      vscode.ConfigurationTarget.Global
    );
  });

  // --- Tests for generateMessage ---
  test("generateMessage - default template", () => {
    // Expect to use the extension's default template: "{b1}({b2}):\n{message}\n\n[{b3}]"
    const branchPartsData = ["feat", "login", "123"];
    const message = "Implement login functionality";
    const expected = "feat(login):\nImplement login functionality\n\n[123]";
    const result = generateMessage(branchPartsData, message);
    assert.strictEqual(result, expected);
  });

  test("generateMessage - already structured message", () => {
    // If the message matches the default structure exactly, it should pass through unchanged
    const branchPartsData = ["fix", "logout", "456"];
    const message = "fix(logout):\nFix logout issue\n\n[456]";
    const result = generateMessage(branchPartsData, message);
    assert.strictEqual(result, message);
  });

  test("generateMessage - custom template with nested braces", async () => {
    const originalTemplate = config.get<string>("template");
    // Template with nested placeholder using double braces
    await config.update(
      "template",
      "{b1}({{b2}}):\n{message}\n\nTicket: {b3}",
      vscode.ConfigurationTarget.Global
    );

    const branchPartsData = ["feat", "login", "123"];
    const message = "commit";
    const expected = "feat({login}):\ncommit\n\nTicket: 123";
    const result = generateMessage(branchPartsData, message);
    assert.strictEqual(result, expected);

    // Restore immediately (though beforeEach/afterEach also does it)
    await config.update(
      "template",
      originalTemplate,
      vscode.ConfigurationTarget.Global
    );
  });

  test("generateMessage - template with missing branch part", async () => {
    const originalTemplate = config.get<string>("template");
    // Template uses {b1} and {b4}
    await config.update(
      "template",
      "Release: {b1} - Version {b4}\n{message}",
      vscode.ConfigurationTarget.Global
    );

    const branchPartsData = ["release"];
    const message = "Final build";
    // Because there's no b4 (index 3), we expect {b4} to remain literal
    const expected = "Release: release - Version {b4}\nFinal build";

    const result = generateMessage(branchPartsData, message);
    assert.strictEqual(result, expected);

    await config.update(
      "template",
      originalTemplate,
      vscode.ConfigurationTarget.Global
    );
  });

  test("generateMessage - template with extra braces (triple braces)", async () => {
    const originalTemplate = config.get<string>("template");
    // triple braces around b1 => expect {b1} to become {data} if b1 = "data"
    await config.update(
      "template",
      "Info: {{{b1}}} - {message}",
      vscode.ConfigurationTarget.Global
    );

    const branchPartsData = ["data"];
    const message = "test";
    const expected = "Info: {data} - test";
    const result = generateMessage(branchPartsData, message);
    assert.strictEqual(result, expected);

    await config.update(
      "template",
      originalTemplate,
      vscode.ConfigurationTarget.Global
    );
  });

  test("generateMessage - trims commit message input", () => {
    const branchPartsData = ["feat", "login", "123"];
    const message = "   commit message with spaces   ";
    const expected = "feat(login):\ncommit message with spaces\n\n[123]";
    const result = generateMessage(branchPartsData, message);
    assert.strictEqual(result, expected);
  });
});
