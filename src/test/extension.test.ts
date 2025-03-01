import * as assert from "assert";
import * as vscode from "vscode";
import { extractInfoFromCurrentBranch } from "../utils/extractInfoFromCurrentBranch";
import { generateMessage, isMessageCompatible } from "../utils/generateMessage";
import {
  DEFAULT_SETTINGS_PATH,
  DEFAULT_TEMPLATE,
  DEFAULT_WORD_SEPARATOR,
  TEMPLATE,
  WORD_SEPARATOR,
} from "../constants";

suite("Extension Test Suite", function () {
  let config: vscode.WorkspaceConfiguration;
  let userOriginalTemplate: string | undefined;
  let userOriginalSeparator: string | undefined;

  this.beforeAll(async () => {
    config = vscode.workspace.getConfiguration(DEFAULT_SETTINGS_PATH);

    userOriginalTemplate = config.get<string>(TEMPLATE);
    userOriginalSeparator = config.get<string>(WORD_SEPARATOR);

    // Force extension defaults
    await config.update(
      TEMPLATE,
      DEFAULT_TEMPLATE,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      WORD_SEPARATOR,
      DEFAULT_WORD_SEPARATOR,
      vscode.ConfigurationTarget.Global
    );
  });

  this.afterAll(async () => {
    // Restore user’s original settings
    await config.update(
      TEMPLATE,
      userOriginalTemplate,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      WORD_SEPARATOR,
      userOriginalSeparator,
      vscode.ConfigurationTarget.Global
    );
  });

  this.beforeEach(async () => {
    await config.update(
      TEMPLATE,
      DEFAULT_TEMPLATE,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      WORD_SEPARATOR,
      DEFAULT_WORD_SEPARATOR,
      vscode.ConfigurationTarget.Global
    );
  });

  this.afterEach(async () => {
    await config.update(
      TEMPLATE,
      DEFAULT_TEMPLATE,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      WORD_SEPARATOR,
      DEFAULT_WORD_SEPARATOR,
      vscode.ConfigurationTarget.Global
    );
  });

  vscode.window.showInformationMessage("Start all tests.");

  // -------------------------------
  // extractInfoFromCurrentBranch tests
  // -------------------------------
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
    const originalSeparator = config.get<string>(WORD_SEPARATOR);

    await config.update(WORD_SEPARATOR, "/", vscode.ConfigurationTarget.Global);

    const branchName = "prefix/123/feat/login";
    const { branchPartsData } = extractInfoFromCurrentBranch(branchName);
    assert.deepStrictEqual(branchPartsData, ["prefix", "123", "feat", "login"]);

    // Restore
    await config.update(
      WORD_SEPARATOR,
      originalSeparator,
      vscode.ConfigurationTarget.Global
    );
  });

  // -------------------------------
  // isMessageCompatible tests
  // -------------------------------
  test("isMessageCompatible - default template, structured message returns true", () => {
    // By default: {b1}({b2}):\n{message}\n\n[{b3}]
    // Suppose the branchPartsData is ["feat", "login", "123"].
    // A matching commit would be:
    const message = "feat(login):\nImplement login functionality\n\n[123]";

    const branchPartsData = ["feat", "login", "123"];
    // isMessageCompatible should return true
    const compatible = isMessageCompatible(branchPartsData, message);
    assert.strictEqual(compatible, true);
  });

  test("isMessageCompatible - default template, unstructured message returns false", () => {
    const message = "Some random commit that doesn't match the prefix/suffix";
    const branchPartsData = ["feat", "login", "123"];

    const compatible = isMessageCompatible(branchPartsData, message);
    assert.strictEqual(compatible, false);
  });

  // -------------------------------
  // generateMessage tests
  // -------------------------------
  test("generateMessage - default template", () => {
    const branchPartsData = ["feat", "login", "123"];
    const message = "Implement login functionality";
    const expected = "feat(login):\nImplement login functionality\n\n[123]";
    const result = generateMessage(branchPartsData, message);
    assert.strictEqual(result, expected);
  });

  test("generateMessage - already structured message", () => {
    // If it matches default structure exactly, generateMessage should return it as-is.
    const branchPartsData = ["fix", "logout", "456"];
    const message = "fix(logout):\nFix logout issue\n\n[456]";
    const result = generateMessage(branchPartsData, message);
    assert.strictEqual(result, message);
  });

  test("generateMessage - custom template with nested braces", async () => {
    const originalTemplate = config.get<string>(TEMPLATE);
    await config.update(
      TEMPLATE,
      "{b1}({{b2}}):\n{message}\n\nTicket: {b3}",
      vscode.ConfigurationTarget.Global
    );

    const branchPartsData = ["feat", "login", "123"];
    const message = "commit";
    const expected = "feat({login}):\ncommit\n\nTicket: 123";
    const result = generateMessage(branchPartsData, message);
    assert.strictEqual(result, expected);

    await config.update(
      TEMPLATE,
      originalTemplate,
      vscode.ConfigurationTarget.Global
    );
  });

  test("generateMessage - template with missing branch part", async () => {
    const originalTemplate = config.get<string>(TEMPLATE);
    await config.update(
      TEMPLATE,
      "Release: {b1} - Version {b4}\n{message}",
      vscode.ConfigurationTarget.Global
    );

    const branchPartsData = ["release"];
    const message = "Final build";
    const expected = "Release: release - Version {b4}\nFinal build";

    const result = generateMessage(branchPartsData, message);
    assert.strictEqual(result, expected);

    await config.update(
      TEMPLATE,
      originalTemplate,
      vscode.ConfigurationTarget.Global
    );
  });

  test("generateMessage - template with extra braces (triple braces)", async () => {
    const originalTemplate = config.get<string>(TEMPLATE);
    await config.update(
      TEMPLATE,
      "Info: {{{b1}}} - {message}",
      vscode.ConfigurationTarget.Global
    );

    const branchPartsData = ["data"];
    const message = "test";
    const expected = "Info: {data} - test";
    const result = generateMessage(branchPartsData, message);
    assert.strictEqual(result, expected);

    await config.update(
      TEMPLATE,
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
