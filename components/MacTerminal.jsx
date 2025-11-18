"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../app/ThemeProvider";

export default function MacTerminal() {
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  const [firstRender, setFirstRender] = useState(true);
  const terminalRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  // === WELCOME ASCII ===
  const welcomeText = String.raw`
  _   _ _   ___ _                _       _                         _                  _     
 | | | (_) |_ _( )_ __ ___      / \   __| |_ __   __ _ _ __       | | __ _ _ ____   _(_)___ 
 | |_| | |  | ||/| '_ \` _ \   / _ \ / _\`| '_ \ / _\`| '_ \   _  | |/ _\`| '__\ \ / / / __|
 |  _  | |  | |  | | | | | |  / ___ \ (_| | | | | (_| | | | | | |_| | (_| | |   \ V /| \__ \ 
 |_| |_|_| |___| |_| |_| |_| /_/   \_\__,_|_| |_|\__,_|_| |_|  \___/ \__,_|_|    \_/ |_|___/
                                                                                             `;

  const tipsText =
    "Tip: type -help to see available commands";

  // == Inject ASCII + tips on load ==
  useEffect(() => {
    setRows([
      { type: "ascii", username: "", content: welcomeText },
      { type: "tip", username: "", content: tipsText },
    ]);

    // delay enabling auto-scroll
    setTimeout(() => setFirstRender(false), 300);
  }, []);

  // === AUTO SCROLL ===
  useEffect(() => {
    if (firstRender) return;

    terminalRef.current?.scrollTo({
      top: terminalRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [rows, firstRender]);

  // === HANDLE SUBMIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // push user row
    setRows((prev) => [
      ...prev,
      {
        type: "user",
        username: "user:~$",
        content: input,
      },
    ]);

    // call backend
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    // push ai row
    setRows((prev) => [
      ...prev,
      {
        type: "adnanai",
        username: "adnan@jarvis:~$",
        content: data.reply,
      },
    ]);

    setInput("");
  };

  return (
    <div className="container">
      <div className="mac-terminal">
        
        {/* HEADER */}
        <div className="header">
          <div className="header__op">
            <span className="header__op-icon header__op-icon--red"></span>
            <span className="header__op-icon header__op-icon--yellow"></span>
            <span className="header__op-icon header__op-icon--green"></span>
          </div>

          <div className="header__title">
            root@desktop:~/askhitchgernn
          </div>

          <button onClick={toggleTheme} className="theme-toggle">
            {theme === "light" ? "Dark" : "Light"} Mode
          </button>
        </div>

        {/* BODY */}
        <div ref={terminalRef} className="body">

          {rows.map((row, i) => (
            <div className="body__row" key={i}>
              {row.username ? (
                <span className="prompt-line">
                  <span className="prompt-username">{row.username}</span>{" "}
                  {row.content}
                </span>
              ) : (
                <pre className="body__row-result">{row.content}</pre>
              )}
            </div>
          ))}

        </div>

        {/* INPUT BAR */}
        <form onSubmit={handleSubmit} className="command-bar">
          <span className="body__row-folder">user:~$</span>

          <div className="input-wrapper">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="terminal-input"
            />
          </div>
        </form>

      </div>
    </div>
  );
}
