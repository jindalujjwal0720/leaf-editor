import React from "react";
import styles from "./Terminal.module.css";

const Terminal = ({
  showTerminal,
  setShowTerminal,
  theme,
  outputLines = [],
  onLineFeed,
}) => {
  const wrapperRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (showTerminal && wrapperRef.current) {
      wrapperRef.current.classList.remove(styles.hide);
    } else {
      wrapperRef.current.classList.add(styles.hide);
    }
  }, [showTerminal]);

  // scroll input into view when new output is added
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView();
      inputRef.current.focus();
    }
  }, [outputLines]);

  return (
    <div ref={wrapperRef} className={styles.wrapper + " " + styles[theme]}>
      <span className={styles.close} onClick={() => setShowTerminal(false)}>
        &times;
      </span>
      <div className={styles.terminal}>
        <div className={styles.output}>
          {outputLines?.map(({ type, line }, index) => {
            if (typeof line !== "string") {
              try {
                line = line.toString();
              } catch (error) {
                line = JSON.stringify(line);
              }
            }
            return (
              <div key={index} className={styles[type]}>
                <pre>{line}</pre>
              </div>
            );
          })}
        </div>
        <div className={styles.input}>
          <div className={styles.prompt}>$</div>
          <input
            ref={inputRef}
            className={styles.inputLine}
            type="text"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (onLineFeed) {
                  onLineFeed(event.target.value);
                }
                event.target.value = "";
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
