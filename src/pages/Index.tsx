import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as Babel from "@babel/standalone";

const Index = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const compileAndExecute = () => {
    try {
      // Clear previous output and errors
      setError(null);
      setOutput("");

      // Create a secure context for console.log
      let outputBuffer = "";
      const secureConsole = {
        log: (...args: any[]) => {
          outputBuffer += args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(" ") + "\n";
          setOutput(outputBuffer);
        },
        error: (...args: any[]) => {
          outputBuffer += "Error: " + args.join(" ") + "\n";
          setOutput(outputBuffer);
        }
      };

      // Transform code to handle console.log
      const transformedCode = Babel.transform(code, {
        presets: ['env'],
      }).code;

      // Create a secure Function with limited scope
      const secureFunction = new Function('console', transformedCode!);
      
      // Execute the code with our secure console
      secureFunction(secureConsole);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          JS Code Playground
        </h1>
        <ResizablePanelGroup 
          direction="horizontal" 
          className="min-h-[80vh] rounded-xl border shadow-lg bg-background/95 backdrop-blur-sm"
        >
          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b bg-muted/30">
                <span className="text-sm font-medium">JavaScript Editor</span>
                <button
                  onClick={compileAndExecute}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200 shadow-sm"
                >
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
                  className="rounded-md overflow-hidden"
                />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Preview Panel */}
          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <h2 className="text-lg font-semibold">Console Output</h2>
              </div>
              <div className="flex-1 font-mono bg-muted/50 p-6 rounded-lg overflow-auto border shadow-inner">
                {error ? (
                  <div className="text-destructive">{error}</div>
                ) : (
                  <pre className="whitespace-pre-wrap">{output}</pre>
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