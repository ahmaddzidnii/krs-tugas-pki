import { create } from "zustand";

import { MessageRole } from "@/generated/prisma/enums";

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    time: string;
}

interface ContextProps {
    userId: string;
    threadId: string;
    sessionId: string;
}

interface AgentState {
    messages: Message[];
    input: string;
    isRecording: boolean;
    isLoading: boolean;

    context?: ContextProps;

    setInput: (text: string) => void;
    toggleRecording: () => void;
    sendMessage: () => Promise<void>;
}


export const useAgentStore = create<AgentState>((set, get) => ({
    messages: [
    ],
    input: "",
    isRecording: false,
    isLoading: false,

    setInput: (text) => set({ input: text }),
    toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),

    sendMessage: async () => {
        const { input, messages } = get();
        if (!input.trim()) return;

        const currentTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        const userMsgId = Date.now().toString();
        const aiMsgId = (Date.now() + 1).toString();

        // 1. Tambahkan pesan user & Siapkan slot kosong untuk pesan AI
        set({
            input: "",
            isLoading: true,
            messages: [
                ...messages,
                { id: userMsgId, role: "USER", content: input, time: currentTime },
                { id: aiMsgId, role: "ASSISTANT", content: "", time: currentTime },
            ],
        });

        try {
            // 2. Fetch ke Backend (Asumsi endpoint Anda /api/chat)
            const response = await fetch("/api/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message: input }),
            });

            if (!response.body) throw new Error("No response body");

            // 3. Logika membaca Stream (SSE) diabstraksi di sini!
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });

                    // Parsing SSE format: "data: {...}\n\n"
                    const lines = chunk.split("\n\n");
                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const dataStr = line.replace("data: ", "");
                            if (dataStr === "[DONE]") break;

                            try {
                                const parsed = JSON.parse(dataStr);

                                // 4. Update state pesan AI secara real-time chunk per chunk
                                set((state) => ({
                                    messages: state.messages.map((msg) =>
                                        msg.id === aiMsgId
                                            ? { ...msg, content: msg.content + parsed.content }
                                            : msg
                                    ),
                                }));
                            } catch (e) {
                                console.error("Failed to parse SSE data:", e);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Gagal mengirim pesan:", error);
        } finally {
            set({ isLoading: false });
        }
    },
}));