"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../app/ThemeProvider";

export default function MacTerminal() {
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  const terminalRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  // Auto scroll
  useEffect(() => {
    terminalRef.current?.scrollTo({
      top: terminalRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [rows]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // USER COMMAND ROW
    setRows((prev) => [
      ...prev,
      {
        type: "user",
        username: "user:~$",
        content: input
      }
    ]);

    // Fetch AI result
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    // AI RESPONSE ROW
    setRows((prev) => [
      ...prev,
      {
        type: "adnanai",
        username: "adnan@ai:~$",
        content: data.reply
      }
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
            root@dekstop:~/askhitchgernn
          </div>

          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </div>

        {/* BODY */}
        <div ref={terminalRef} className="body">

          {/* LOOP ALL ROWS */}
        {rows.map((row, i) => (
          <div className="body__row" key={i}>
            <span className="prompt-line">
              <span className="prompt-username">{row.username}</span> {row.content}
            </span>
          </div>
        ))}




        </div>

        {/* INPUT LINE */}
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
