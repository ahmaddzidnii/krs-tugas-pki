import { z } from "zod";

import { KrsAgent } from "@/agent/krs";
import { getServerSideSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { getKrsScheduleStatus } from "@/lib/krs-schedule";

export const chatRequestSchema = z.object({
    message: z
        .string()
        .trim()
        .min(1, "Message tidak boleh kosong")
        .max(4000, "Message terlalu panjang"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export async function POST(request: Request) {
    const body = await request.json();

    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            {
                message: "Pastikan request body sesuai format yang diharapkan.",
                errors: parsed.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    const { message } = parsed.data;

    const session = await getServerSideSession();

    const cookieStore = await cookies();
    const threadId = cookieStore.get("agent_thread_id")?.value;

    const scheduleStatus = await getKrsScheduleStatus();

    if (!threadId) {
        return Response.json(
            {
                message: "Agent belum diinisialisasi.",
            },
            { status: 401 }
        );
    }


    const agent = new KrsAgent({
        threadId,
        apiKey: process.env.GOOGLE_GENAI_API_KEY!,
        context: {
            sessionId: session?.session.id,
            isKrsOpen: scheduleStatus.isKrsOpen,
        }
    });

    const stream = await agent.streamResponse(message);
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}