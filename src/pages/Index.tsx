import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Binary, Github } from "lucide-react";
import * as Babel from "@babel/standalone";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VoltLabIcon from "../../jscpg.svg";

const BinaryBackground = () => {
  const [binaryStrings, setBinaryStrings] = useState<string[]>([]);

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
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5 rotate-6">
      {binaryStrings.map((str, i) => (
        <div
          key={i}
          className="font-mono text-sm whitespace-nowrap animate-fade-in"
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
  const [code, setCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("editorCode") || "";
    }
    return "";
  });
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleEditorChange = (value: string | undefined) => {
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
      const timers: { [key: string]: number } = {};

      const secureConsole = {
        log: (...args: any[]) => {
          outputBuffer +=
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg) : String(arg)
              )
              .join(" ") + "\n";
          setOutput(outputBuffer);
        },
        error: (...args: any[]) => {
          outputBuffer += "Error: " + args.join(" ") + "\n";
          setOutput(outputBuffer);
        },
        time: (label: string = "default") => {
          if (timers[label]) {
            secureConsole.error(
              `Timer '${label}' already exists. Use a different label or call console.timeEnd('${label}') before starting a new timer with the same label.`
            );
            return;
          }
          if (typeof performance !== "undefined" && performance.now) {
            timers[label] = performance.now();
          } else {
            timers[label] = Date.now();
          }
        },
        timeEnd: (label: string = "default") => {
          if (timers[label]) {
            let duration: number;
            if (typeof performance !== "undefined" && performance.now) {
              duration = performance.now() - timers[label];
              duration = parseFloat(duration.toFixed(3)); // three decimal places
            } else {
              duration = Date.now() - timers[label];
            }
            outputBuffer += `${label}: ${duration}ms\n`;
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
    window.open("https://github.com/Xaypanya", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted relative">
      <BinaryBackground />
      <div className="container mx-auto py-6 px-4 relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={goToGitHub}
                className="absolute top-8 right-4 border p-2 rounded-full"
              >
                <Github className="text-black" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Xaypanya Phongsa</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex justify-center items-center gap-4 mb-8">
          <img
            src={VoltLabIcon}
            alt="Logo"
            className="w-12 h-12 transition-transform hover:scale-110"
          />
          <h1
            className="text-4xl font-bold tracking-tighter"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Volt Lab
          </h1>
        </div>
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[80vh] rounded-xl border shadow-lg bg-background/95 backdrop-blur-sm"
        >
          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b bg-muted/30">
                <span className="text-sm font-medium">JavaScript Editor</span>
                <button
                  onClick={compileAndExecute}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200 shadow-sm"
                >
                  <Binary size={18} />
                  Run Code
                </button>
              </div>
              <div className="flex-1 p-4">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    padding: { top: 24, bottom: 24 },
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
            <div className="h-full flex flex-col p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h2 className="text-lg font-semibold flex items-center justify-center gap-1">
                    Console Output
                  </h2>
                </div>
                <button
                  className="ml-auto text-sm text-muted-foreground hover:text-foreground"
                  onClick={clearOutput}
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 font-mono bg-black p-6 rounded overflow-auto border shadow-inner">
                {error ? (
                  <div className="text-destructive">{error}</div>
                ) : (
                  <pre className="whitespace-pre-wrap text-green-500">
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
