export const commands = {
  "help": () => {
    return (
`
Available commands:
 help       Show all commands
 bio        About Adnan
 skills     List skills
 projects   List portfolio projects
 contact    Show contact info
 clear      Clear the terminal
 hitchgernn If only you're curious about this
 Or you can just ask directly
 `
    );
  },

  whoami: () => {
    return "You are the user interacting with AdnanAI terminal.";
  },

  bio: () => {
    return (
`
Name: Adnan Abdul Majid
From: Magelang, Indonesia
Major: Information Engineering @ UGM
Interests: AI, Machine Learning, Backend Development`
    );
  },

  skills: () => {
    return (
`
Skills:
- Backend: Node.js, Express, Next.js, REST APIs
- AI/ML: Python, TensorFlow, PyTorch, Agents, RAG
- Tools: Docker, Git, Linux, Supabase
- Languages: C++, Python, JavaScript`
    );
  },

  projects: () => {
    return (
`
Projects:
- AskMe-AI Terminal Chatbot
- Chathub AI Multi-agent Backend
- Trading Bot with AI Signal Engine (unrealized)`
    );
  },

  contact: () => {
    return (
`Contact:
- Email: adnan@example.com
- GitHub: github.com/yourname
- LinkedIn: linkedin.com/in/yourname`
    );
  },

  hitchgernn: () => {
    return (
`Hitchgernn is actually my online / ingame name`
    );
  },

  clear: () => "__CLEAR__"
};
