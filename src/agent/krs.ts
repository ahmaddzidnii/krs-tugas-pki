import { randomUUID } from "node:crypto";
import { createAgent, HumanMessage, SystemMessage } from "langchain";
import type { StructuredToolInterface } from "@langchain/core/tools";

import { getServerSideSession } from "@/lib/auth";

import { LOGOUT_USER, SEARCH_ACADEMIC_RULES, GET_CURRENT_DATETIME, GET_KRS_SCHEDULE_STATUS, GET_KRS_REQUIREMENTS, GET_OFFERED_COURSES, GET_COURSE_CAPACITY, ADD_KRS_COURSE, REMOVE_KRS_COURSE, GET_CURRENT_KRS_STATUS } from "./tools";

import { getLLM } from "./lib/llm";
import { MemoryManager } from "./lib/memory";
import { getKrsSystemPrompt } from "./lib/prompts";

const PUBLIC_TOOLS: StructuredToolInterface[] = [GET_CURRENT_DATETIME, GET_KRS_SCHEDULE_STATUS, SEARCH_ACADEMIC_RULES];

const AUTHENTICATED_INFO_TOOLS: StructuredToolInterface[] = [GET_CURRENT_KRS_STATUS, GET_KRS_REQUIREMENTS, GET_OFFERED_COURSES, GET_COURSE_CAPACITY, LOGOUT_USER];

const KRS_ACTION_TOOLS: StructuredToolInterface[] = [ADD_KRS_COURSE, REMOVE_KRS_COURSE];

interface KrsAgentContext extends Record<string, unknown> {
  session?: Awaited<ReturnType<typeof getServerSideSession>>;
  isKrsOpen?: boolean;
}

interface KrsAgentConfig {
  threadId: string;
  apiKey: string;
  context: KrsAgentContext;
}

const terminal = {
  cyan: "\u001b[36m",
  yellow: "\u001b[33m",
  green: "\u001b[32m",
  red: "\u001b[31m",
  blue: "\u001b[34m",
  magenta: "\u001b[35m",
  bold: "\u001b[1m",
  dim: "\u001b[90m",
  reset: "\u001b[0m",
};

function colorize(color: string, value: string): string {
  return `${color}${value}${terminal.reset}`;
}

function formatLogValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, (_key, item: unknown) => (typeof item === "bigint" ? `${item.toString()}n` : item), 2) ?? String(value);
  } catch {
    return String(value);
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function logSection(color: string, title: string, lines: string[]): void {
  console.log(`\n${colorize(color, `┌── ${title} ${"─".repeat(Math.max(2, 56 - title.length))}`)}`);

  for (const line of lines) {
    console.log(`${colorize(color, "│")} ${line}`);
  }

  console.log(colorize(color, `└${"─".repeat(62)}`));
}

export class KrsAgent {
  private readonly memoryManager: MemoryManager;
  private readonly llm: ReturnType<typeof getLLM>;

  constructor(private config: KrsAgentConfig) {
    this.memoryManager = new MemoryManager(config.threadId, config.apiKey);

    this.llm = getLLM(config.apiKey);
  }

  private getAvailableTools(): StructuredToolInterface[] {
    const isGuest = !this.config.context.session;
    const tools = [...PUBLIC_TOOLS];

    if (!isGuest) {
      tools.push(...AUTHENTICATED_INFO_TOOLS);

      if (this.config.context.isKrsOpen) {
        tools.push(...KRS_ACTION_TOOLS);
      }
    }

    return tools;
  }

  private async buildMessages(userMessage: string) {
    const workingMemory = await this.memoryManager.loadWorkingMemory();

    const mahasiswa = this.config.context.session?.user;
    const isGuest = !this.config.context.session;

    const baseSystemPrompt = getKrsSystemPrompt(isGuest);

    const studentContext = mahasiswa
      ? `
KONTEKS MAHASISWA SAAT INI:
- Nama: ${mahasiswa.nama}
- Program Studi: ${mahasiswa.programStudi.jenjang_studi} ${mahasiswa.programStudi.nama}
- Fakultas: ${mahasiswa.fakultas}
`.trim()
      : null;

    const systemPrompt = new SystemMessage([baseSystemPrompt.content, studentContext].filter(Boolean).join("\n\n"));

    return [systemPrompt, ...workingMemory, new HumanMessage(userMessage)];
  }

  public async streamResponse(userMessage: string): Promise<ReadableStream> {
    const requestId = randomUUID();
    const startedAt = Date.now();
    const availableTools = this.getAvailableTools();

    const mountedTools = availableTools.map(({ name }) => name);

    console.log(`\n${colorize(terminal.cyan, "╔════════════════════ AGENT CYCLE STARTED ════════════════════╗")}`);

    console.log(`${colorize(terminal.cyan, "║")} ${colorize(terminal.bold, "Request ID:")} ${requestId}`);

    console.log(`${colorize(terminal.cyan, "║")} ${colorize(terminal.bold, "User Prompt:")} ${JSON.stringify(userMessage)}`);

    console.log(`${colorize(terminal.cyan, "║")} ${colorize(terminal.bold, `Tools Mounted (${mountedTools.length}):`)} [${mountedTools.join(", ")}]`);

    console.log(colorize(terminal.cyan, "╚═════════════════════════════════════════════════════════════╝"));

    console.log(colorize(terminal.dim, `[AGENT] Started at ${new Date().toISOString()}`));

    let eventStream: ReturnType<ReturnType<typeof createAgent>["streamEvents"]>;

    try {
      console.log(colorize(terminal.blue, "[AGENT SETUP] Loading working memory..."));

      const messages = await this.buildMessages(userMessage);

      console.log(colorize(terminal.blue, `[AGENT SETUP] Messages prepared: ${messages.length}`));

      const agent = createAgent({
        model: this.llm,
        tools: availableTools,
      });

      console.log(colorize(terminal.blue, "[AGENT SETUP] Agent created. Starting event stream..."));

      eventStream = agent.streamEvents(
        { messages },
        {
          version: "v2",
          configurable: {
            session: this.config.context.session,
          },
        },
      );
    } catch (error) {
      console.error(colorize(terminal.red, "[AGENT SETUP ERROR]"), {
        requestId,
        durationMs: Date.now() - startedAt,
        error: getErrorMessage(error),
      });

      throw error;
    }

    return new ReadableStream({
      start: async (controller) => {
        const encoder = new TextEncoder();
        let fullAiResponse = "";
        let requestFailed = false;
        let hadExecutionErrors = false;

        const runStartedAt = new Map<string, number>();

        try {
          for await (const event of eventStream) {
            switch (event.event) {
              case "on_chain_start": {
                console.log(`${colorize(terminal.blue, "[AGENT STEP]")} ${event.name} started`);

                break;
              }

              case "on_chat_model_start": {
                runStartedAt.set(event.run_id, Date.now());

                console.log(`\n${colorize(terminal.blue, "[LLM REQUEST]")} ${event.name}`);

                console.log(colorize(terminal.dim, `Run ID: ${event.run_id}`));

                break;
              }

              case "on_chain_end": {
                console.log(`${colorize(terminal.dim, "[AGENT STEP COMPLETED]")} ${event.name}`);

                break;
              }

              case "on_chat_model_end": {
                const runStart = runStartedAt.get(event.run_id);

                runStartedAt.delete(event.run_id);

                const duration = runStart ? Date.now() - runStart : 0;

                console.log(`${colorize(terminal.blue, "[LLM STREAMING]")} ... ${colorize(terminal.green, "[DONE]")} ${colorize(terminal.dim, `(${duration}ms)`)}`);

                break;
              }

              case "on_chain_error":
              case "on_chat_model_error": {
                hadExecutionErrors = true;

                const runStart = runStartedAt.get(event.run_id);

                runStartedAt.delete(event.run_id);

                console.error(`${colorize(terminal.red, "[LLM / CHAIN ERROR]")} ${event.name}: ${getErrorMessage(event.data.error)}`, runStart ? colorize(terminal.dim, `(${Date.now() - runStart}ms)`) : "");

                break;
              }

              case "on_tool_start": {
                runStartedAt.set(event.run_id, Date.now());

                logSection(terminal.yellow, "HARNESS DISPATCH", [`Calling Tool: ${colorize(terminal.bold, event.name)}`, `Run ID: ${event.run_id}`, "Args:", formatLogValue(event.data.input)]);

                break;
              }

              case "on_tool_end": {
                const runStart = runStartedAt.get(event.run_id);

                runStartedAt.delete(event.run_id);

                const duration = runStart ? Date.now() - runStart : 0;

                logSection(terminal.green, "TOOL COMPLETED", [`Result from: ${colorize(terminal.bold, event.name)}`, `Duration: ${duration}ms`, "Output:", formatLogValue(event.data.output)]);

                break;
              }

              case "on_tool_error": {
                hadExecutionErrors = true;

                console.error(`\n${colorize(terminal.red, "[TOOL ERROR]")} ${event.name}`);

                console.error(colorize(terminal.red, getErrorMessage(event.data.error)));

                break;
              }

              case "on_chat_model_stream": {
                const chunk = event.data.chunk.content;

                if (typeof chunk === "string" && chunk.length > 0) {
                  fullAiResponse += chunk;

                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
                }

                break;
              }
            }
          }

          console.log(colorize(terminal.blue, "[AGENT] Saving interaction to memory..."));

          await this.memoryManager.saveInteraction(userMessage, fullAiResponse);

          logSection(terminal.blue, "AGENT FINAL RESPONSE", [fullAiResponse || "(Empty response)"]);

          controller.enqueue(encoder.encode("event: done\ndata: [DONE]\n\n"));
        } catch (error) {
          requestFailed = true;

          console.error(colorize(terminal.red, "[CYCLE ERROR]"), getErrorMessage(error));

          try {
            controller.enqueue(
              encoder.encode(
                `event: error\ndata: ${JSON.stringify({
                  message: "Stream error",
                })}\n\n`,
              ),
            );
          } catch {
            // Stream may already be closed by the consumer.
          }
        } finally {
          const status = requestFailed ? "FAILED" : hadExecutionErrors ? "COMPLETED WITH ERRORS" : "COMPLETED";

          const statusColor = requestFailed ? terminal.red : hadExecutionErrors ? terminal.yellow : terminal.magenta;

          console.log(`\n${colorize(statusColor, `[CYCLE FINISHED] ${status} in ${Date.now() - startedAt}ms`)}`);

          console.log(colorize(terminal.dim, `Request ID: ${requestId}`));

          console.log(colorize(statusColor, "════════════════════ END AGENT CYCLE ════════════════════\n"));

          controller.close();
        }
      },
    });
  }
}
