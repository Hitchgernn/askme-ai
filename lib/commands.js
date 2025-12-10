export const commands = {
  "help": () => {
    return (
`
Available commands:
 help       Show all commands
 bio        About Nanda
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
- Tools: Docker, Git, Linux, Supabase etc
- Languages: C++, Python, JavaScript`
    );
  },

  projects: () => {
    return (
`
Projects:
- Askhtichgernn Terminal Chatbot
- Chathub AI Multi-agent Backend
- AI Focus Guardian`
    );
  },

  contact: () => {
    return (
`Contact:
- Email: -
- GitHub: github.com/Hitchgernn
- LinkedIn: linkedin.com/in/adnan-abdul-majid`
    );
  },

  hitchgernn: () => {
    return (
`Hitchgernn is actually my online / ingame name. Want a complete answer? just ask my assistant`
    );
  },

  clear: () => "__CLEAR__"
};
