import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Binary, Github, Expand, Minimize, Play } from "lucide-react";
import * as Babel from "@babel/standalone";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VoltLabIcon from "../../jscpg.svg";

const BinaryBackground = () => {
  const [binaryStrings, setBinaryStrings] = useState([]);

  useEffect(() => {
    const generateBinaryString = () => {
      return Array.from({ length: 50 }, () =>
        Math.random() > 0.5 ? "1" : "0"
      ).join("");
    };

    const initialStrings = Array.from({ length: 20 }, generateBinaryString);
    setBinaryStrings(initialStrings);

    const interval = setInterval(() => {
      setBinaryStrings((prev) => {
        const newStrings = [...prev];
        const randomIndex = Math.floor(Math.random() * newStrings.length);
        newStrings[randomIndex] = generateBinaryString();
        return newStrings;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10 rotate-6">
      {binaryStrings.map((str, i) => (
        <div
          key={i}
          className="font-mono text-xs sm:text-sm whitespace-nowrap animate-fade-in"
          style={{
            transform: `translateY(${i * 24}px)`,
            color: "currentColor",
          }}
        >
          {str}
        </div>
      ))}
    </div>
  );
};

const Index = () => {
  const [code, setCode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("editorCode") || "";
    }
    return "";
  });
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsVerticalLayout(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEditorChange = (value) => {
    if (value !== undefined) {
      setCode(value);
      localStorage.setItem("editorCode", value);
    }
  };

  const compileAndExecute = () => {
    try {
      setError(null);
      setOutput("");

      let outputBuffer = "";
      const timers = {};

      const secureConsole = {
        log: (...args) => {
          outputBuffer +=
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg) : String(arg)
              )
              .join(" ") + "\n";
          setOutput(outputBuffer);
        },
        error: (...args) => {
          outputBuffer += "Error: " + args.join(" ") + "\n";
          setOutput(outputBuffer);
        },
        time: (label = "default") => {
          if (timers[label]) {
            secureConsole.error(
              `Timer '${label}' already exists.`
            );
            return;
          }
          timers[label] = performance.now();
        },
        timeEnd: (label = "default") => {
          if (timers[label]) {
            const duration = performance.now() - timers[label];
            outputBuffer += `${label}: ${parseFloat(duration.toFixed(3))}ms\n`;
            setOutput(outputBuffer);
            delete timers[label];
          } else {
            secureConsole.error(`Timer '${label}' does not exist.`);
          }
        },
      };

      const transformedCode = Babel.transform(code, {
        presets: ["env"],
      }).code;

      const secureFunction = new Function("console", transformedCode);
      secureFunction(secureConsole);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const clearOutput = () => {
    setOutput("");
    setError(null);
  };

  const goToGitHub = () => {
    window.open("https://github.com/Xaypanya/js-codeplayground", "_blank");
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-background to-muted relative ${
      isFullScreen ? 'fixed inset-0 z-50 bg-background' : ''
    }`}>
      <BinaryBackground />
      <div className={`container mx-auto py-4 sm:py-6 px-2 sm:px-4 relative ${
        isFullScreen ? 'h-full p-0' : ''
      }`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={goToGitHub}
                className={`absolute top-4 sm:top-8 bg-white right-2 sm:right-4 border p-2 rounded-full ${
                  isFullScreen ? 'hidden' : ''
                }`}
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Repository</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className={`flex justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-8 ${
          isFullScreen ? 'hidden' : ''
        }`}>
          <img
            src={VoltLabIcon}
            alt="Logo"
            className="w-8 h-8 sm:w-12 sm:h-12 transition-transform hover:scale-110"
          />
          <h1
            className="text-2xl sm:text-4xl font-bold tracking-tighter"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Volt Lab
          </h1>
        </div>

        <ResizablePanelGroup
          direction={isVerticalLayout ? "vertical" : "horizontal"}
          className={`${
            isFullScreen 
              ? 'fixed inset-0 rounded-none border-none'
              : 'min-h-[70vh] sm:min-h-[80vh] rounded-lg sm:rounded-xl border shadow-lg'
          } bg-background/95 backdrop-blur-sm`}
        >
          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center p-2 sm:p-4 border-b bg-muted/30">
                <span className="text-xs sm:text-sm font-medium">JavaScript Editor</span>
                <div className="flex gap-1 sm:gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={toggleFullScreen}
                          className="p-1 sm:p-2 hover:bg-muted rounded-md transition-colors"
                        >
                          {isFullScreen ? (
                            <Minimize className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <Expand className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <button
                    onClick={compileAndExecute}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200 shadow-sm text-xs sm:text-sm"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    Run 
                  </button>
                </div>
              </div>
              <div className="flex-1 p-2 sm:p-4">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: window.innerWidth > 768 },
                    fontSize: window.innerWidth < 640 ? 12 : 14,
                    padding: { top: 16, bottom: 16 },
                    wordWrap: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    folding: true,
                    bracketPairColorization: { enabled: true },
                  }}
                  className="rounded overflow-hidden"
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col p-3 sm:p-6">
              <div className="flex items-center mb-2 sm:mb-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
                  <h2 className="text-sm sm:text-lg font-semibold flex items-center justify-center gap-1">
                    Console Output
                  </h2>
                </div>
                <button
                  className="ml-auto text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                  onClick={clearOutput}
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 font-mono bg-black p-3 sm:p-6 rounded overflow-auto border shadow-inner">
                {error ? (
                  <div className="text-destructive text-xs sm:text-sm">{error}</div>
                ) : (
                  <pre className="whitespace-pre-wrap text-green-500 text-xs sm:text-sm">
                    {output}
                  </pre>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;