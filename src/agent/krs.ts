import { createAgent, HumanMessage, SystemMessage } from "langchain";
import type { StructuredToolInterface } from "@langchain/core/tools";

import { getServerSideSession } from "@/lib/auth";

import {
    LOGOUT_USER,
    SEARCH_ACADEMIC_RULES,
    GET_CURRENT_DATETIME,
    GET_KRS_SCHEDULE_STATUS,
    GET_CURRENT_KRS_INFO,
    GET_KRS_REQUIREMENTS,
    GET_OFFERED_COURSES,
    GET_CURRENT_KRS,
    GET_COURSE_CAPACITY,
    ADD_KRS_COURSE,
    REMOVE_KRS_COURSE,
} from "./tools";

import { getLLM } from "./lib/llm";
import { MemoryManager } from "./lib/memory";
import { getKrsSystemPrompt } from "./lib/prompts";


const PUBLIC_TOOLS: StructuredToolInterface[] = [
    GET_CURRENT_DATETIME,
    GET_KRS_SCHEDULE_STATUS,
    SEARCH_ACADEMIC_RULES,
];

const AUTHENTICATED_INFO_TOOLS: StructuredToolInterface[] = [
    GET_CURRENT_KRS_INFO,
    GET_KRS_REQUIREMENTS,
    GET_OFFERED_COURSES,
    GET_CURRENT_KRS,
    GET_COURSE_CAPACITY,
    LOGOUT_USER
];

const KRS_ACTION_TOOLS: StructuredToolInterface[] = [
    ADD_KRS_COURSE,
    REMOVE_KRS_COURSE,
];

interface KrsAgentContext extends Record<string, unknown> {
    session?: Awaited<ReturnType<typeof getServerSideSession>>;
    isKrsOpen?: boolean;
}

interface KrsAgentConfig {
    threadId: string;
    apiKey: string;
    context: KrsAgentContext;
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
        const workingMemory =
            await this.memoryManager.loadWorkingMemory();

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

        const systemPrompt = new SystemMessage(
            [baseSystemPrompt.content, studentContext]
                .filter(Boolean)
                .join("\n\n")
        );

        return [
            systemPrompt,
            ...workingMemory,
            new HumanMessage(userMessage),
        ];
    }

    public async streamResponse(userMessage: string): Promise<ReadableStream> {
        const availableTools = this.getAvailableTools();
        const messages = await this.buildMessages(userMessage);

        const agent = createAgent({ model: this.llm, tools: availableTools });

        const eventStream = agent.streamEvents(
            { messages: messages },
            {
                version: "v2",
                configurable: {
                    session: this.config.context.session,
                }
            }

        );

        return new ReadableStream({
            start: async (controller) => {
                const encoder = new TextEncoder();
                let fullAiResponse = "";

                try {
                    for await (const event of eventStream) {
                        console.log(`[${event.event}]`, event.name ?? "");

                        switch (event.event) {
                            case "on_tool_start":
                                console.log("[TOOL START:]", event.name);
                                console.log("INPUT:", event.data.input);
                                break;

                            case "on_tool_end":
                                console.log("[TOOL END:]", event.name);
                                console.log("OUTPUT:", event.data.output);
                                break;

                            case "on_tool_error":
                                console.error("[TOOL ERROR:]", event.name);
                                console.error(event.data.error);
                                break;

                            case "on_chat_model_stream": {
                                const chunk = event.data.chunk.content;

                                if (typeof chunk === "string" && chunk.length > 0) {
                                    fullAiResponse += chunk;

                                    controller.enqueue(
                                        encoder.encode(
                                            `data: ${JSON.stringify({ content: chunk })}\n\n`
                                        )
                                    );
                                }

                                break;
                            }

                            case "on_chat_model_end":
                                console.log("[MODEL END]");
                                break;

                            default:
                                break;
                        }
                    }

                    await this.memoryManager.saveInteraction(userMessage, fullAiResponse);

                    controller.enqueue(
                        encoder.encode("event: done\ndata: [DONE]\n\n")
                    );

                } catch (error) {
                    controller.enqueue(
                        encoder.encode(
                            `event: error\ndata: ${JSON.stringify({ message: "Stream error" })}\n\n`
                        )
                    );
                    console.error("Error in streamResponse:", error);
                } finally {
                    controller.close();
                }
            },
        });
    }
}