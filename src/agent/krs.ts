import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, createAgent, HumanMessage } from "langchain";
import type { StructuredToolInterface } from "@langchain/core/tools";

import prisma from "@/lib/prisma";

import { getKrsSystemPrompt } from "./lib/prompts";

import { LOGOUT_USER } from "./tools/logout_user";
import { GET_CLASS_SCHEDULE } from "./tools/class_schedule";
import { SEARCH_ACADEMIC_RULES } from "./tools/academic_rules";
import { GET_CURRENT_DATETIME } from "./tools/current_datetime";
import { GET_COURSE_INFORMATION } from "./tools/course_information";
import { GET_KRS_SCHEDULE_STATUS } from "./tools/krs_schedule_status";
import { GET_CURRENT_KRS_INFO } from "./tools/get_current_krs_info";
import { GET_KRS_REQUIREMENTS } from "./tools/get_krs_requirements";
import { GET_OFFERED_COURSES } from "./tools/get_offered_courses";
import { GET_CURRENT_KRS } from "./tools/get_current_krs";
import { GET_COURSE_CAPACITY } from "./tools/get_course_capacity";
import { ADD_KRS_COURSE } from "./tools/add_krs_course";
import { REMOVE_KRS_COURSE } from "./tools/remove_krs_course";


const PUBLIC_TOOLS: StructuredToolInterface[] = [
    GET_CURRENT_DATETIME,
    GET_KRS_SCHEDULE_STATUS,
    SEARCH_ACADEMIC_RULES,
    GET_COURSE_INFORMATION,
    GET_CLASS_SCHEDULE,
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
    sessionId?: string;
    isKrsOpen?: boolean;
}

interface KrsAgentConfig {
    threadId: string;
    apiKey: string;
    context: KrsAgentContext;
}

export class KrsAgent {
    private readonly threadId: string;
    private readonly context: KrsAgentContext;
    private readonly apiKey: string;

    constructor({ threadId, apiKey, context }: KrsAgentConfig) {
        this.threadId = threadId;
        this.apiKey = apiKey;
        this.context = context;
    }

    private async loadMemory() {
        const chatHistory = await prisma.message.findMany({
            where: { threadId: this.threadId },
            orderBy: { created_at: "desc" },
            take: 12,
        });


        return chatHistory.map((msg) =>
            msg.role === "USER"
                ? new HumanMessage(msg.content)
                : new AIMessage(msg.content)
        ).reverse();
    }

    public async streamResponse(userMessage: string): Promise<ReadableStream> {
        const threadId = this.threadId;
        const isGuest = !this.context.sessionId;

        // Load tools based on context
        const availableTools = [...PUBLIC_TOOLS];

        if (!isGuest) {
            availableTools.push(...AUTHENTICATED_INFO_TOOLS);

            if (this.context.isKrsOpen) {
                availableTools.push(...KRS_ACTION_TOOLS);
            }
        }

        const formattedHistory = await this.loadMemory();

        const systemPrompt = getKrsSystemPrompt(isGuest);
        const humanMessage = new HumanMessage(userMessage);

        const messages = [
            systemPrompt,
            ...formattedHistory,
            humanMessage,
        ];

        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-3.5-flash-lite",
            temperature: 0,
            apiKey: this.apiKey,
        });

        const agent = createAgent({ model: llm, tools: availableTools });

        const eventStream = agent.streamEvents(
            { messages: messages },
            { version: "v2", configurable: { sessionId: this.context.sessionId } }

        );

        return new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullAiResponse = "";

                try {
                    for await (const event of eventStream) {
                        // Debug semua event LangChain
                        console.log(`[${event.event}]`, event.name ?? "");

                        switch (event.event) {
                            case "on_tool_start":
                                console.log("🟢 TOOL START:", event.name);
                                console.log("INPUT:", event.data.input);
                                break;

                            case "on_tool_end":
                                console.log("🔵 TOOL END:", event.name);
                                console.log("OUTPUT:", event.data.output);
                                break;

                            case "on_tool_error":
                                console.error("🔴 TOOL ERROR:", event.name);
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
                                console.log("🟣 MODEL END");
                                break;

                            default:
                                break;
                        }
                    }


                    controller.enqueue(
                        encoder.encode("event: done\ndata: [DONE]\n\n")
                    );

                    const currentEpoch = Date.now();

                    await prisma.message.createMany({
                        data: [
                            {
                                threadId: threadId,
                                role: "USER",
                                content: userMessage,
                                created_at: currentEpoch - 1,
                            },
                            {
                                threadId: threadId,
                                role: "ASSISTANT",
                                content: fullAiResponse,
                                created_at: currentEpoch,
                            },
                        ],
                    });

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