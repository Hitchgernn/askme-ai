"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../app/ThemeProvider";
import { commands } from "../lib/commands";

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

export default function MacTerminal() {
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  const [firstRender, setFirstRender] = useState(true);
  const terminalRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const welcomeText = String.raw`
                                                                                                                                                                                       
  _   _ _  ___ _              _   _ _ _       _                                 
 | | | (_) |_ _( )_ __ ___   | | | (_) |_ ___| |__   __ _  ___ _ ___ _ __ _ ___  
 | |_| | |  | ||/| '_ \` _\  | |_| | | __/ __| '_ \ / / _\/  _ \ '__| '_ \| '_ \ 
 |  _  | |  | |  | | | | | | |  _  | | || (__| | | | (_| |   __/ |  | | | | | | |
 |_| |_|_| |___| |_| |_| |_| |_| |_|_|\__\___|_| |_|\ __ |\____|_|  |_| |_|_| |_|
                                                    |___/                        
                                                                                                                                                              
  `;
  const tips = "Tips:"
  const tipsText1 = "* Type 'help' to see available basic commands";
  const tipsText2 = "* Or type ur questions directly"
  const textEnter = `
  
  `
  useEffect(() => {
    setRows([
      { type: "ascii", username: "", content: welcomeText },
      { type: "tip", username: "", content: tips },
      { type: "tip", username: "", content: tipsText1}, 
      { type: "tip", username: "", content: tipsText2},
      // { type: "tip", username: "", content: textEnter},
    ]);

    setTimeout(() => setFirstRender(false), 300);
  }, []);

  useEffect(() => {
    if (firstRender) return;
    terminalRef.current?.scrollTo({
      top: terminalRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [rows, firstRender]);

  const executeCommand = async (text) => {
    const cmd = text.trim();

    if (commands[cmd]) {
      const result = commands[cmd]();

      if (result === "__CLEAR__") {
        setRows([]);
        return;
      }

      // directly print result (no typing)
      setRows((prev) => [
        ...prev,
        {
          type: "adnanai",
          username: "adnan@jarvis:~$",
          content: result,
        },
      ]);

      return;
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    const fullText = data.reply;

    const aiRowIndex = rows.length + 1; 

    setRows((prev) => [
      ...prev,
      {
        type: "adnanai",
        username: "adnan@jarvis:~$",
        content: "",     // start empty
      },
    ]);

    const chars = fullText.split("");

    for (let i = 0; i < chars.length; i++) {
      await wait(8); // speed: lower -> faster typing

      setRows((prev) => {
        const updated = [...prev];
        updated[aiRowIndex].content = fullText.slice(0, i + 1);
        return updated;
      });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setInput("");

    // user row
    setRows((prev) => [
      ...prev,
      { type: "user", username: "user:~$", content: currentInput },
    ]);

    await executeCommand(currentInput);
  };

  return (
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

      {/* INPUT */}
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
  );
}
