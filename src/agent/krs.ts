import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, createAgent, HumanMessage } from "langchain";

import prisma from "@/lib/prisma";

import { ragTool } from "./tools/rag";
import { krsTool } from "./tools/krs";
import { getKrsSystemPrompt } from "./lib/prompts";


interface KrsAgentConfig {
    threadId: string;
    authSession: string | null;
}

export class KrsAgent {
    private threadId: string;
    private authSession: string | null;
    private apiKey: string = process.env.GOOGLE_GENAI_API_KEY!;

    constructor({ threadId, authSession }: KrsAgentConfig) {
        this.threadId = threadId;
        this.authSession = authSession;
    }

    private async loadMemory() {
        const chatHistory = await prisma.message.findMany({
            where: { threadId: this.threadId },
            orderBy: { created_at: "asc" },
            take: 12,
        });


        return chatHistory.map((msg) =>
            msg.role === "USER"
                ? new HumanMessage(msg.content)
                : new AIMessage(msg.content)
        );
    }

    public async streamResponse(userMessage: string): Promise<ReadableStream> {

        const sessionId = this.authSession;
        const isGuest = !sessionId;

        const threadId = this.threadId;

        const availableTools = isGuest ? [ragTool] : [ragTool, krsTool];


        const formattedHistory = await this.loadMemory();

        const dynamicPrompt = getKrsSystemPrompt(isGuest);

        const messages = [
            dynamicPrompt,
            ...formattedHistory,
            { role: "user", content: userMessage }
        ];

        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-3.5-flash-lite",
            temperature: 0,
            apiKey: this.apiKey,
        });

        const agent = createAgent({ model: llm, tools: availableTools });

        const eventStream = agent.streamEvents(
            { messages: messages },
            { version: "v2", configurable: { authSession: this.authSession } }
        );

        return new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullAiResponse = "";

                try {
                    for await (const event of eventStream) {
                        if (event.event === "on_chat_model_stream") {
                            const chunk = event.data.chunk.content;

                            if (typeof chunk === "string" && chunk.length > 0) {
                                fullAiResponse += chunk;

                                controller.enqueue(
                                    encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
                                );
                            }
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