import React, { useState, useRef } from "react";
import axios from "axios";
import CodeTemplates from "../templates/CodeTemplate";
import Editor from "../components/Editor";
import ThemeTemplates from "../templates/ThemeTemplate";
import "../fonts/stylesheet.css";
import logo from "../images/logo.jpeg";

const Home = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(CodeTemplates.cpp);
  const [theme, setTheme] = useState("night");

  const codeRef = useRef(code);
  const languageRef = useRef("cpp");
  const editorRef = useRef(null);
  const themeRef = useRef(theme);

  const clearCode = () => {
    const templateCode = CodeTemplates[languageRef.current];
    codeRef.current = templateCode;
    setCode(templateCode);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    codeRef.current = newCode;
  };

  const onLanguageChange = (event) => {
    event.preventDefault();
    const selectedLanguage = event.target.value;
    languageRef.current = selectedLanguage;
    const templateCode = CodeTemplates[selectedLanguage];
    setCode(templateCode);
    codeRef.current = templateCode;
  };

  const onThemeChange = (event) => {
    event.preventDefault();
    const selectedTheme = event.target.value;
    setTheme(selectedTheme);
    themeRef.current = selectedTheme;
    if (editorRef.current) {
      editorRef.current.setOption("theme", selectedTheme);
    }
    document.documentElement.style.setProperty(
      "--editor-background-color",
      ThemeTemplates[selectedTheme]
    );
  };

  const runCode = async () => {
    setIsLoading(true);
    const options = {
      method: "POST",
      url: "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": import.meta.env.VITE_ONECOMPILER_API,
        "X-RapidAPI-Host": "onecompiler-apis.p.rapidapi.com",
      },
      data: {
        language: languageRef.current,
        files: [
          {
            name: `index.${languageRef.current}`,
            content: codeRef.current,
          },
        ],
        stdin: input,
      },
    };

    try {
      const response = await axios.request(options);
      let outputText = "";

      if (response.data.status === "success") {
        if (response.data.exception) {
          outputText = response.data.exception;
        } else {
          outputText = response.data.stdout;
        }
      } else {
        outputText = "Error occurred while running the code.";
      }
      setOutput(outputText);
    } catch (error) {
      console.error("Error:", error);
      setOutput("Error occurred while running the code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="h-10 w-10 rounded-full" />
            <h1 className="text-xl font-semibold text-gray-700">Coderz</h1>
          </div>
          <div className="flex space-x-4">
            <select
              onChange={onThemeChange}
              value={theme}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {Object.keys(ThemeTemplates).map((themeName) => (
                <option key={themeName} value={themeName.toLowerCase()}>
                  {themeName}
                </option>
              ))}
            </select>
            <select
              onChange={onLanguageChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="cpp">C++ GCC17</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="c">C GCC17</option>
            </select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        <section className="flex-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Code Editor</h2>
          <div className="border rounded-lg overflow-y-auto h-96">
            <Editor
              value={code}
              theme={theme}
              onCodeChange={handleCodeChange}
              editorRef={editorRef}
            />
          </div>
          <div className="flex justify-end mt-4 space-x-4">
            <button
              onClick={clearCode}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Clear
            </button>
            <button
              onClick={runCode}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Run
            </button>
          </div>
        </section>

        <section className="w-full lg:w-1/3 flex flex-col space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Input</h2>
            <textarea
              id="input"
              placeholder="Enter your input here"
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Output</h2>
            <div
              id="output"
              className="w-full h-40 p-3 border rounded-lg bg-gray-50 overflow-y-auto"
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="loader"></div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-gray-800">{output}</pre>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-4 fixed bottom-0 w-full">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Coderz. Made by Gokhul Kooranchi.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
