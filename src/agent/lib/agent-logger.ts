const colors = {
    reset: "\x1b[0m",
    dim: "\x1b[2m",
    bold: "\x1b[1m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
};



export const AgentLogger = {
    startCycle: (userMessage: string, availableTools: string[]) => {
        console.log(`\n${colors.cyan}${colors.bold}┌──────────────────────── AGENT CYCLE STARTED ────────────────────────┐${colors.reset}`);
        console.log(`${colors.cyan}│${colors.reset} ${colors.bold}User Prompt:${colors.reset} "${userMessage}"`);
        console.log(`${colors.cyan}│${colors.reset} ${colors.dim}Tools Mounted (${availableTools.length}): [${availableTools.join(", ")}]${colors.reset}`);
        console.log(`${colors.cyan}└────────────────────────────────────────────────────────────────────────┘${colors.reset}\n`);
    },

    toolStart: (toolName: string, input: unknown) => {
        console.log(`${colors.yellow} [HARNESS DISPATCH] Calling Tool: ${colors.bold}${toolName}${colors.reset}`);
        console.log(`${colors.yellow}   Args:${colors.reset}`);
        console.log(formatPayload(input));
    },

    toolEnd: (toolName: string, output: unknown) => {
        console.log(`${colors.green} [TOOL COMPLETED] Result from: ${colors.bold}${toolName}${colors.reset}`);
        console.log(`${colors.green}   Output:${colors.reset}`);
        console.log(formatPayload(output));
        console.log(`${colors.dim}   ─────────────────────────────────────────────────────────────${colors.reset}`);
    },

    toolError: (toolName: string, error: unknown) => {
        console.log(`${colors.red}[TOOL FAILED] Error on: ${colors.bold}${toolName}${colors.reset}`);
        console.log(formatPayload(error));
    },

    modelStreamingStart: () => {
        process.stdout.write(`${colors.blue}[LLM STREAMING]${colors.reset} `);
    },

    modelStreamingChunk: () => {
        // Dot indicator ringan saat token sedang mengalir
        process.stdout.write(`${colors.dim}.${colors.reset}`);
    },

    modelEnd: () => {
        console.log(` ${colors.green}[DONE]${colors.reset}`);
    },

    endCycle: (durationMs: number) => {
        console.log(`\n${colors.magenta}${colors.bold}[CYCLE FINISHED] Completed in ${durationMs}ms${colors.reset}\n`);
    },

    error: (err: unknown) => {
        console.log(`\n${colors.red}${colors.bold}[AGENT HARNESS FATAL ERROR]${colors.reset}`);
        console.error(err);
    },
};

function extractActualOutput(data: unknown): unknown {
    if (!data) return data;

    // Ekstrak jika output dibungkus ToolMessage LangChain
    let raw: unknown = data;
    if (typeof data === "object" && data !== null) {
        // Handle instance ToolMessage atau representasi serialisasinya
        if ("content" in data) {
            raw = (data as { content: unknown }).content;
        } else if ("kwargs" in data && typeof (data as any).kwargs === "object") {
            raw = (data as any).kwargs.content ?? data;
        }
    }

    // Jika isinya string JSON yang ter-escape, parse ulang biar kebaca utuh
    if (typeof raw === "string") {
        try {
            return JSON.parse(raw);
        } catch {
            return raw;
        }
    }

    return raw;
}

function formatPayload(data: unknown): string {
    const cleanedData = extractActualOutput(data);
    if (!cleanedData) return `    \x1b[2m│ (empty)\x1b[0m`;

    try {
        const str =
            typeof cleanedData === "string"
                ? cleanedData
                : JSON.stringify(cleanedData, null, 2);

        return str
            .split("\n")
            .map((line) => `    \x1b[2m│\x1b[0m ${line}`)
            .join("\n");
    } catch {
        return `    \x1b[2m│ [Unserializable Payload]\x1b[0m`;
    }
}