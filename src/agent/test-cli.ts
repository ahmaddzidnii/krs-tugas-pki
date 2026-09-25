import "dotenv/config";

import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { KrsAgent } from "./krs";

async function runTest() {
    const rl = readline.createInterface({ input, output });

    // Simulasi Session ID dan User ID (seolah-olah user sudah login)
    const sessionId = "test-session-001";
    const userId = "mahasiswa-123";

    // Inisiasi Agent
    const agent = new KrsAgent(sessionId, userId);

    console.log("=========================================");
    console.log("🤖 KrsAgent CLI Test (Ketik 'exit' untuk keluar)");
    console.log("=========================================\n");

    while (true) {
        // Minta input dari user
        const userMessage = await rl.question("Kamu: ");
        if (userMessage.toLowerCase() === "exit") break;

        process.stdout.write("Agent: ");

        try {
            // Panggil method stream yang sudah kamu buat
            const stream = await agent.streamResponse(userMessage);

            // Karena outputnya ReadableStream (Web API), kita baca pakai reader
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode Uint8Array ke string dan print langsung ke terminal
                const chunk = decoder.decode(value, { stream: true });
                process.stdout.write(chunk);
            }
            console.log("\n"); // Tambah baris baru setelah agent selesai menjawab

        } catch (error) {
            console.error("\n[Error System]:", error);
        }
    }

    rl.close();
    process.exit(0);
}

runTest();