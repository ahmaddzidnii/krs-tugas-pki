import prisma from "@/lib/prisma";
import { AIMessage, HumanMessage } from "langchain";

export class MemoryManager {
    constructor(private threadId: string, private apiKey: string) { }

    // Working Memory
    async loadWorkingMemory(limit = 12) {
        const chatHistory = await prisma.message.findMany({
            where: { threadId: this.threadId },
            orderBy: { created_at: "desc" },
            take: limit,
        });

        return chatHistory.map((msg) =>
            msg.role === "USER" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        ).reverse();
    }

    // Episodic Memory 
    async getEpisodicContext(userMessage: string, userId: string) {
        // TODO: Implement episodic memory retrieval based on userMessage and userId
        return "";
    }

    async saveInteraction(userMessage: string, aiResponse: string) {
        const currentEpoch = Date.now();
        await prisma.message.createMany({
            data: [
                { threadId: this.threadId, role: "USER", content: userMessage, created_at: currentEpoch - 1 },
                { threadId: this.threadId, role: "ASSISTANT", content: aiResponse, created_at: currentEpoch },
            ],
        });
    }
}