
import { searchVectorStore } from "@/agent/rag/vectorstore";
import { SEARCH_ACADEMIC_RULES } from "@/agent/tools/academic_rules";

async function runManualTest() {
    // Ganti kalimat tanya di sini sesuai hal yang mau kamu uji
    const testQuery = "Apa syarat tugas akhir?";

    console.log("==================================================");
    console.log(`🔎 QUERY UJI COBA: "${testQuery}"`);
    console.log("==================================================\n");

    const startTime = performance.now();

    // 1. Uji Raw Vector Search (Detail Teknis)
    console.log("--- [1. DETAIL CHUNK TERDEKAT (RAW)] ---");
    const rawResults = await searchVectorStore(testQuery, 3);

    const duration = (performance.now() - startTime).toFixed(1);
    console.log(`⚡ Waktu pencarian: ${duration} ms\n`);

    rawResults.forEach((item, index) => {
        const similarity = (item.score * 100).toFixed(1);
        console.log(`[Peringkat ${index + 1}]`);
        console.log(`📄 Dokumen   : ${item.fileName}`);
        console.log(`📑 Halaman   : Hal. ${item.page}`);
        console.log(`🎯 Kemiripan : ${similarity}%`);
        console.log(`📝 Cuplikan Teks:\n${item.content}`);
        console.log("--------------------------------------------------");
    });

    // 2. Uji Eksekusi via LangChain Tool (Format Masuk ke LLM)
    console.log("\n--- [2. OUTPUT YANG DITERIMA LLM (VIA TOOL)] ---");
    const toolOutput = await SEARCH_ACADEMIC_RULES.invoke({
        query: testQuery,
    });

    console.log(toolOutput);
    console.log("==================================================");
}

runManualTest().catch((err) => {
    console.error("Terjadi error saat testing:", err);
});