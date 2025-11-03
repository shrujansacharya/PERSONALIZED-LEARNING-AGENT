// src/components/codingData.tsx
import React from "react";
import { Code2, Globe, Settings, TerminalSquare, Cpu, Database, BookOpen } from "lucide-react";

/**
 * Structured lesson data for CodingHub
 * FIX: Removed duplicate makeTopics function definition.
 */

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Example {
  id: string;
  title: string;
  code: string;
  explanation: string;
}

export interface Step {
  id: string;
  title: string;
  instructions: string;        // Concise challenge description
  explanation: string;         // Detailed description of the topic (shown to user)
  analogy: string;             // Kid-friendly analogy
  starterCode: string;         // Minimal pre-filled code in IDE
  expectedOutput: string;      // Human-friendly expected output summary
  examples: Example[];         // 2-4 examples
  problems: string[];          // practice problems (4-6)
  goalKeywords: string[];      // keywords for quick success check
}

export interface ModuleData {
  id: string;
  name: string;
  logo: string;
  icon: React.ReactElement;
  badge: string;
  difficulty: Difficulty;
  topics: Step[];
}

/* =========================
   Topic titles (15 per language) - MUST BE DEFINED FIRST
   ========================= */

const pyTitles = [
  "Print & Hello",
  "Variables: Boxes",
  "Numbers & Math",
  "Strings & Quotes",
  "Lists: Order Boxes",
  "If Statements: Choices",
  "Loops: Repeat Actions",
  "Functions: Small Machines",
  "Dictionaries: Labels",
  "Input: Ask the User",
  "File Read/Write (Intro)",
  "Errors & Debugging",
  "Modules: Using Tools",
  "Simple Game: Guess Number",
  "Wrap-up Project"
];

const jsTitles = [
  "Console Log", "Variables (let/const)", "DOM: Select Elements", "Events: Clicks", 
  "Functions & Return", "Arrays: Collections", "Objects: Key-Value", "Loops & Iteration", 
  "Timers & setTimeout", "JSON: Data Format", "Forms & Inputs", "Simple Animation", 
  "Fetch: Get Data", "Mini App: To-Do", "Wrap-up Project"
];

const htmlTitles = [
  "HTML Structure", "Headings & Paragraphs", "Links & Images", "Lists & Tables", 
  "Forms & Inputs", "Semantic Tags", "Inline CSS", "Classes & IDs", 
  "Layout Basics", "Media: Audio & Video", "Embedding & Iframes", "Accessibility Basics", 
  "Meta Tags & SEO", "Micro-interactions", "Wrap-up Page"
];

const sqlTitles = [
  "SELECT Basics", "WHERE Filters", "ORDER & LIMIT", "COUNT & Aggregates", 
  "JOIN Intro", "CREATE Table", "INSERT Rows", "UPDATE Rows", 
  "DELETE Rows", "Indexes Intro", "GROUP BY", "HAVING Clause", 
  "Subqueries", "Transactions Intro", "Wrap-up DB"
];

const cppTitles = [
  "Hello C++", "Vars & Types", "Ifs & Comparisons", "Loops in C++", 
  "Functions", "Arrays & Vectors", "Pointers (Intro)", "Structs", 
  "File IO", "Compile & Run", "Memory Basics", "Debugging Tips", 
  "Simple CLI App", "Standard Library", "Wrap-up App"
];

const javaTitles = [
  "Java Hello", "Types & Variables", "If & Logic", "Loops & Arrays", 
  "Methods & Classes", "Objects & Fields", "Collections Intro", "Exceptions (Intro)", 
  "File IO", "Simple GUI Idea", "Threads Intro", "Generics Intro", 
  "Streams Intro", "Mini App", "Wrap-up Project"
];

const scratchTitles = [
  "Sequence & Steps", "Events: When Clicked", "Move Sprite", "Looks & Say", 
  "Sound & Music", "Variables Block", "If Blocks", "Repeat Blocks", 
  "Broadcast Message", "Clone Sprite", "Score System", "Game Logic", 
  "Animation Tricks", "Share & Remix", "Wrap-up Game"
];

/* ----------------------
   Helper to build topics - This is the ONLY definition
   ---------------------- */
function makeTopics(
  baseId: string,
  titles: string[],
  starterTemplate: (title: string) => string,
  goalKeywordsTemplate: (title: string) => string[],
  examplesTemplate: (title: string) => Example[],
  analogyTemplate: (title: string) => string,
  expectedTemplate: (title: string) => string,
  explanationTemplate: (title: string) => string, 
  problemsTemplate: (t: string) => string[] = (t) => [
    `Write a short code example demonstrating ${t}.`,
    `Modify the example and explain the change.`,
    `Create a tiny mini-challenge using ${t}.`,
    `Explain in your own words what ${t} does.`,
  ]
): Step[] {
  return titles.map((t, i) => ({
    id: `${baseId}-${i + 1}`,
    title: t,
    instructions:
      `Your challenge: ${t}! Use the analogy and examples to help you. Achieve the expected output: "${expectedTemplate(t)}". Try the practice problems when ready.`,
    explanation: explanationTemplate(t), // Detailed explanation
    analogy: analogyTemplate(t),
    starterCode: starterTemplate(t),
    expectedOutput: expectedTemplate(t),
    examples: examplesTemplate(t),
    problems: problemsTemplate(t),
    goalKeywords: goalKeywordsTemplate(t),
  }));
}

/* =========================
   MODULE CONTENT TEMPLATES - Final Definitions
   ========================= */

/* ---------------- Python Module ---------------- */
const pythonModule: ModuleData = {
  id: "python",
  name: "Python",
  logo: "🐍",
  icon: <Code2 size={28} className="text-white" />,
  badge: "Python Pal",
  difficulty: "Beginner",
  topics: makeTopics(
    "py",
    pyTitles,
    // Starter Code Template 
    (t) => {
      switch (true) {
        case /Print & Hello/.test(t): return `print("Hello!")\nprint("Write your message below:")\n`;
        case /Variables: Boxes/.test(t): return `my_age = 10\nprint("I am", my_age, "years old.")\n`;
        case /Strings & Quotes/.test(t): return `message = "I am a string!"\n# Change the text above and print it\n`;
        default: return `# Write your code for ${t} here\n`;
      }
    },
    // Goal Keywords Template
    (t) => {
      if (/Print/.test(t)) return ["print", "hello"];
      if (/Variables/.test(t)) return ["=", "score"];
      if (/Strings/.test(t)) return ['"', "text", "message"];
      return [t.split(" ")[0].toLowerCase()];
    },
    // Examples Template
    (t) => {
      if (/Strings & Quotes/.test(t)) {
        return [
          { id: "py-str-1", title: "Single Quotes", code: `name = 'Alice'\nprint(name)`, explanation: "You can use single quotes to define text." },
          { id: "py-str-2", title: "Double Quotes", code: `phrase = "Learning code is fun!"\nprint(phrase)`, explanation: "Double quotes work exactly the same way in Python." }
        ];
      }
      if (/Print/.test(t)) {
        return [
          { id: "py-print-1", title: "Print text", code: `print("Hello world!")`, explanation: "The print() command makes your computer speak." },
          { id: "py-print-2", title: "Print numbers", code: `print(123 + 7)`, explanation: "You can print the result of a math problem directly." }
        ];
      }
      return [
        { id: `${t}-ex1`, title: "Example 1", code: `# Example for ${t}\n`, explanation: "Try and modify this example." },
      ];
    },
    // Analogy Template
    (t) => {
      if (/Strings/.test(t)) return "Strings are like a message written on a piece of paper. The quotes are the envelope holding the message safe.";
      if (/Print/.test(t)) return "Think of print() as your computer speaking out loud.";
      return `A helpful way to visualize ${t} for kids.`;
    },
    // Expected Output Template
    (t) => {
      if (/Print/.test(t)) return "Hello, coder!";
      if (/Strings/.test(t)) return "Learning code is fun!";
      return "See examples";
    },
    // Explanation Template (Detailed text)
    (t) => {
      if (/Strings & Quotes/.test(t)) return "Strings are sequences of characters used to store text. In Python, you must wrap text in **single quotes ('')** or **double quotes (\" \")** to tell the computer that it is a string of text, not a variable name or command. Without quotes, the code interpreter gets confused!";
      if (/Print/.test(t)) return "The most fundamental thing you can do in programming is display information. In Python, you use the `print()` function, followed by what you want to show inside parentheses. This is how your program talks to the user!";
      return `This section provides the detailed explanation for the topic: ${t}.`;
    },
    // Problems Template
    (t) => {
      if (/Strings/.test(t)) {
        return [
          `Create a string variable called 'hobby' with the value 'reading' and print it.`,
          `Write a single print command that prints your name in double quotes and your favorite animal in single quotes.`,
          `What happens if you use a double quote inside a double-quoted string? Try to fix it!`
        ];
      }
      if (/Print/.test(t)) {
        return [
          `Print "Code is fun!" on the screen.`,
          `Calculate and print the value of 100 divided by 4.`,
          `Print a message using your name: 'My name is [your name]'.`,
          `What happens if you forget the quotes when printing text? Try it!`
        ];
      }
      return [
        `Create a short program related to ${t}.`,
        `Change one example and explain what changed.`,
        `Make a tiny challenge combining two ideas from this lesson.`
      ];
    }
  )
};

/* ---------------- Placeholder Modules (You need to fill these out) ---------------- */
const createPlaceholderModule = (id: string, name: string, logo: string, icon: React.ReactElement, difficulty: Difficulty, titles: string[]): ModuleData => ({
    id, name, logo, icon, difficulty, badge: `${name} Coder`,
    topics: titles.map((t, i) => ({
        id: `${id}-${i + 1}`,
        title: t,
        instructions: `Challenge: Master ${t}.`,
        explanation: `This is a placeholder explanation for ${t}. Please update codingData.tsx with detailed content.`,
        analogy: `Think of ${t} as building blocks.`,
        starterCode: `// Start your code for ${t} here\n`,
        expectedOutput: "Example Output",
        examples: [{ id: "a", title: "Example", code: "// Code", explanation: "Code example" }],
        problems: ["Problem 1", "Problem 2"],
        goalKeywords: [t.split(" ")[0].toLowerCase()],
    }))
});

const jsModule = createPlaceholderModule("javascript", "JavaScript", "⚡", <Globe size={28} className="text-white" />, "Intermediate", jsTitles);
const htmlModule = createPlaceholderModule("html", "HTML & CSS", "🌐", <Settings size={28} className="text-white" />, "Beginner", htmlTitles);
const sqlModule = createPlaceholderModule("sql", "SQL", "🧮", <Database size={28} className="text-white" />, "Beginner", sqlTitles);
const cppModule = createPlaceholderModule("cpp", "C++", "💻", <Cpu size={28} className="text-white" />, "Intermediate", cppTitles);
const javaModule = createPlaceholderModule("java", "Java", "☕", <TerminalSquare size={28} className="text-white" />, "Intermediate", javaTitles);
const scratchModule = createPlaceholderModule("scratch", "Scratch Logic", "🧩", <BookOpen size={28} className="text-white" />, "Beginner", scratchTitles);

/* =========================
   Export all modules in an array
   ========================= */
export const codingAcademyData: ModuleData[] = [
  pythonModule, htmlModule, jsModule, sqlModule, cppModule, javaModule, scratchModule
];

export default codingAcademyData;