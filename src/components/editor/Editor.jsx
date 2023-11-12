import React from "react";
import { Editor, useMonaco } from "@monaco-editor/react";
import styles from "./Editor.module.css";
import logo from "./../../logo.png";
import Terminal from "../shell/Terminal";
import { run as tryRunLeafCode } from "./../../assets/compiler/browser.bundle";

const keywords = ["set", "change"];
const controlKeywords = ["if", "else", "to", "task", "from", "by", "for", "in"];
const operators = ["plus", "minus", "times", "divide", "modulo"];
const functions = ["print", "ask"];

const getHelpText = () => {
  return `Leaf Programming Language Help
  Commands:
  clear - clear the terminal
  help - show this help text
  run - run the code`;
};

const CodeEditor = () => {
  const monaco = useMonaco();
  const [theme, setTheme] = React.useState("light");
  const [fontSize, setFontSize] = React.useState(16);
  const [outputLines, setOutputLines] = React.useState([]);
  const [showTerminal, setShowTerminal] = React.useState(false);

  const onLineFeed = (line) => {
    if (line === "clear") {
      setOutputLines([]);
      return;
    } else if (line === "help") {
      setOutputLines([
        ...outputLines,
        {
          type: "help",
          line: getHelpText(),
        },
      ]);
      return;
    } else if (line === "run") {
      onRunCode();
      return;
    } else {
      setOutputLines([
        ...outputLines,
        {
          type: "error",
          line: `'${line}' is not a valid command`,
        },
      ]);
    }
  };

  const onRunCode = () => {
    setOutputLines([
      ...outputLines,
      {
        type: "info",
        line: "running code...",
      },
    ]);
    setTimeout(() => {
      try {
        const code = monaco.editor.getModels()[0].getValue();
        const output = tryRunLeafCode(code);
        setOutputLines([
          ...outputLines,
          ...output.map((line) => ({
            type: "output",
            line,
          })),
        ]);
      } catch (error) {
        setOutputLines([
          ...outputLines,
          {
            type: "error",
            line: error.message || error,
          },
        ]);
      }
    }, 0);
    setShowTerminal(true);
  };

  React.useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: "leaf" });
      monaco.languages.setMonarchTokensProvider("leaf", {
        keywords,
        operators,
        functions,
        controlKeywords,
        tokenizer: {
          root: [
            [
              /[a-zA-Z]+/,
              {
                cases: {
                  "@keywords": "keyword",
                  "@controlKeywords": "keyword.control",
                  "@functions": "function",
                  "@operators": "operator",
                  "@default": "identifier",
                },
              },
            ],
            [/\s/, "white"],
            [/[0-9]+/, "number"],
            [/".*"/, "string"],
            [/\b(?:true|false)\b/, "boolean"],
            [/\b(?:[0-9]+(.[0-9]+)?)\b/, "number"],
            [/\b(?:[a-zA-Z]+)\b/, "identifier"],
            [/#.*$/, "comment"],
          ],
        },
      });
      // add autocomplete
      monaco.languages.registerCompletionItemProvider("leaf", {
        provideCompletionItems: () => {
          const suggestions = [
            ...keywords.map((keyword) => ({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
            })),
            ...operators.map((operator) => ({
              label: operator,
              kind: monaco.languages.CompletionItemKind.Operator,
              insertText: operator,
            })),
            ...functions.map((func) => ({
              label: func,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: func,
            })),
          ];
          return {
            suggestions,
          };
        },
      });
      // configure the keybindings
      monaco.languages.setLanguageConfiguration("leaf", {
        comments: {
          lineComment: "#",
        },
        brackets: [
          ["{", "}"],
          ["[", "]"],
          ["(", ")"],
        ],
        autoClosingPairs: [
          { open: "{", close: "}" },
          { open: "[", close: "]" },
          { open: "(", close: ")" },
          { open: '"', close: '"' },
        ],
      });
      // add the vscode dark theme
      monaco.editor.defineTheme("dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "operator", foreground: "ffe8c9" },
          { token: "function", foreground: "ffc475" },
        ],
        colors: {},
      });
      // add the vscode light theme
      monaco.editor.defineTheme("light", {
        base: "vs",
        inherit: true,
        rules: [
          { token: "operator", foreground: "9017ff" },
          { token: "function", foreground: "ff00ff" },
        ],
        colors: {},
      });
    }
  }, [monaco]);

  return (
    <div className={styles.wrapper + " " + styles[theme]}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.logo}>
            <img src={logo} alt="logo" />
          </span>
          Leaf Programming Language
        </h1>
        <div className={styles.actions}>
          <button className={styles.run} onClick={onRunCode}>
            Run
          </button>
          <button
            className={styles.terminal}
            onClick={() => setShowTerminal(!showTerminal)}
          >
            Terminal
          </button>
        </div>
        <div className={styles.options}>
          <div className={styles.theme}>
            <label htmlFor="theme">Theme</label>
            <select
              name="theme"
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div className={styles.fontSize}>
            <label htmlFor="fontSize">Font</label>
            <input
              type="number"
              name="fontSize"
              id="fontSize"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            />
          </div>
        </div>
      </header>
      <Editor
        height="calc(100dvh - 3.1rem)"
        defaultLanguage="leaf"
        defaultValue={
          "# write some leaf code here\n# press F1 for command pallete"
        }
        theme={theme}
        options={{
          fontSize,
          minimap: {
            enabled: false,
          },
        }}
      />
      <Terminal
        showTerminal={showTerminal}
        setShowTerminal={setShowTerminal}
        theme={theme}
        outputLines={outputLines}
        onLineFeed={onLineFeed}
      />
    </div>
  );
};

export default CodeEditor;
