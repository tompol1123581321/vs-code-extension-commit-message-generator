# Commit Message Structure Generator - Build and Publish Instructions

## Overview:

This extension automatically generates a customizable commit message structure
based on your current Git branch name. The extension is configured via the
"commitMessageStructure" settings (e.g., wordSeparator and template). This file
describes how to build, package, and publish the extension.

## Prerequisites:

1. Node.js and npm must be installed.
2. Install TypeScript, ESLint, esbuild, and other dependencies (already defined in package.json).
3. Install vsce (Visual Studio Code Extension Manager) globally if you haven't already:

   npm install -g vsce

4. (For publishing) You must have a publisher account on the Visual Studio Marketplace.
   Make sure the "publisher" field in package.json is set correctly (currently "Tomas Polivka").

## Building the Extension:

1. Install all dependencies:

   npm install

2. To compile and package your extension for publishing, run the following command:

   npm run package

   This command runs the following steps:

   - "check-types": Ensures your TypeScript code compiles without errors.
   - "lint": Runs ESLint on your source code.
   - "node esbuild.js --production": Bundles and compiles your extension code into the dist/ folder.

3. After running npm run package, a .vsix file will be generated in your extension folder.
   You can test this file by installing it locally:

   code --install-extension commit-message-structure-generator-<version>.vsix

## Testing the Extension:

1. You can run your test suite with the following command:

   npm run test

2. The test script uses the VS Code Test Runner and your test workspace (see the test script in package.json).

## Publishing the Extension:

1. Before publishing, update your version in package.json (e.g., from "1.0.0" to "1.0.1")
   to reflect your changes.

2. Log in to your publisher account using vsce:

   vsce login "Tomas Polivka"

   This will prompt you to enter your Personal Access Token (PAT) from the Visual Studio Marketplace.
   (If you don't have one, follow the official docs to create one.)

3. To publish your extension, run:

   vsce publish

   (You can also publish a specific version by running "vsce publish <version>" if needed.)

4. Once published, your extension will be available on the Visual Studio Marketplace.

## Additional Notes:

- If you need to change the activation behavior of the extension, update the "activationEvents"
  array in package.json. For example, to auto-activate when a workspace contains a Git repository, add:

  "activationEvents": [
  "workspaceContains:.git"
  ]

- Make sure to test your extension thoroughly before publishing new versions.
- You can use "npm run watch" to continuously compile your changes during development.

Enjoy your extension and happy coding!

=====================================================================
