Commit Message Structure Generator 🚀📝

Automatically format your Git commit messages according to a customizable template. This extension ensures that your commit messages are consistent, clear, and follow your project's conventions!

---

Features ✨

• Automatic Commit Message Formatting
As you type in the Source Control commit box, the extension reads your current Git branch name and automatically inserts a commit message prefix/suffix based on your chosen template.

• Customizable Template
Define your own message structure using placeholders like {b1}, {b2}, {b3}, and {message}. The default template is:

    {b1}({b2}):
    {message}

    [{b3}]

Which might produce:

    feat(login):
    Implement login functionality

    [123]

• Branch Splitting
By default, branch parts are split using a hyphen (-). For example:
Branch Name: feat-login-123
Parts: ['feat', 'login', '123']
You can change the word separator to something else (like / or \_) via VS Code settings.

---

Installation & Usage 🚦

1.  Install the Extension

    - Press Ctrl + Shift + X (Windows/Linux) or Cmd + Shift + X (macOS) to open the Extensions view.
    - Search for "Commit Message Structure Generator".
    - Click "Install".

2.  Open a Git Repository
    Make sure you have a Git repository open in VS Code.

3.  Set Up Your Template (Optional)

    - Open File > Preferences > Settings (or press Ctrl + , on Windows / Cmd + , on macOS).
    - Search for "Commit Message Structure Generator".
    - Adjust the wordSeparator if your branch naming convention differs from the default (-).
    - Customize the template to your preferred format. For example, the default is:

      {b1}({b2}):
      {message}

      [{b3}]

      You can add more placeholders (like {b4}) or remove them if needed.

4.  Commit
    When you type your commit message in the Source Control panel, the extension will automatically format it according to your template.
    For example, if your branch is feat/login/123 and you type a message, it might become:

        feat(login):
        Some commit message

        [123]

---

Configuration Options ⚙️

All settings are under the commitMessageStructure namespace.

• commitMessageStructure.wordSeparator
Type: string
Default: -
Description: Delimiter used to split your branch name into parts (e.g. {b1}, {b2}, {b3}, etc.).

• commitMessageStructure.template
Type: string
Default:
{b1}({b2}):
{message}

    [{b3}]

Description: Your custom commit template. The placeholders are: - {b1}, {b2}, {b3}, … → the parts extracted from your branch name. - {message} → the commit message you type.

Examples:

Default Template
Template:
{b1}({b2}):
{message}

    [{b3}]

Example:
If your branch is feat-login-123 and your commit message is “Implement login flow”, the final commit message is:

      feat(login):
      Implement login flow

      [123]

Release Template
Template:
Release: {b1} - Version {b4}
{message}
Example:
If your branch is release (only one part), then {b1} becomes "release" and {b4} remains literal as {b4}.

Nested Braces Example
Template:
{b1}({{b2}}):
{message}

    Ticket: {b3}

Example:
If {b2} equals "login", the output will include a literal {login}:

      feat({login}):
      Implement login functionality

      Ticket: 123

---

Contributing 🤝

• Clone this repository.
• Install dependencies: npm install.
• Open in VS Code and run the extension in the Extension Development Host.
• Run tests: npm run test.
• Submit a PR or open an issue with suggestions!

---

License 📝

MIT License © 2023 Your Name

---

Enjoy clean, consistent commit messages with the Commit Message Structure Generator! 🎉
