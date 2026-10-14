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

let recognitionInstance: any = null;
let textPrefix = "";

export const useAgentStore = create<AgentState>((set, get) => ({
    messages: [],
    input: "",
    isRecording: false,
    isLoading: false,

    setInput: (text) => set({ input: text }),

    toggleRecording: () => {
        if (typeof window === "undefined") return;
        const { isRecording } = get();

        if (isRecording) {
            if (recognitionInstance) {
                recognitionInstance.stop();
            }
            set({ isRecording: false });
            return;
        }

        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Browser belum mendukung Web Speech API. Disarankan menggunakan Google Chrome atau Microsoft Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "id-ID";
        recognition.continuous = true;
        recognition.interimResults = true;

        const currentInput = get().input;
        textPrefix = currentInput ? `${currentInput.trim()} ` : "";

        recognition.onresult = (event: any) => {
            let sessionTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                sessionTranscript += event.results[i][0].transcript;
            }
            // Auto-fill langsung ke input form
            set({ input: textPrefix + sessionTranscript });
        };

        recognition.onerror = (event: any) => {
            // no-speech bukan error fatal, hanya tanda user belum/tidak bersuara
            if (event.error === "no-speech") {
                console.warn("Speech recognition: Tidak ada suara terdeteksi.");
                return;
            }

            // User sengaja menekan tombol cancel/stop
            if (event.error === "aborted") {
                return;
            }

            // Tangani error izin mic
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                alert("Izin mikrofon ditolak atau diblokir oleh browser.");
            } else {
                console.error("Speech recognition error:", event.error);
            }

            set({ isRecording: false });
        };

        recognition.onend = () => {
            // Browser otomatis stop jika silence timeout (no-speech) atau mic dimatikan
            set({ isRecording: false });
            recognitionInstance = null;
        };

        recognitionInstance = recognition;
        recognition.start();
        set({ isRecording: true });
    },

    sendMessage: async () => {
        const { input, messages, isRecording, toggleRecording } = get();
        if (!input.trim()) return;

        // Stop mic jika user kirim pesan saat masih merekam
        if (isRecording) {
            toggleRecording();
        }

        const currentTime = new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
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
            // 2. Fetch ke Backend (/api/agent)
            const response = await fetch("/api/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message: input }),
            });

            if (!response.body) throw new Error("No response body");

            // 3. Logika membaca Stream (SSE)
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });

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