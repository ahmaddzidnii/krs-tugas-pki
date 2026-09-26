// scripts/ingest.ts
import fs from "fs";
import path from "path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { loadPdfPages } from "@/agent/rag/pdf-reader";
import { generateLocalVector } from "@/agent/rag/local-embeddings";

export interface VectorRecord {
    id: number;
    fileName: string; // Menyimpan nama file dokumen sumber
    page: number;
    content: string;
    embedding: number[];
}

async function runIngest() {
    const docsDir = path.join(process.cwd(), "data/docs");
    const outputDir = path.join(process.cwd(), "data/vectorstore");
    const outputFile = path.join(outputDir, "academic_vectors.json");

    // 1. Pastikan folder data/docs ada
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
        console.error(`Folder '${docsDir}' baru dibuat dan masih kosong.`);
        console.error("Silakan masukkan file-file PDF ke folder tersebut lalu jalankan lagi.");
        process.exit(1);
    }

    // 2. Deteksi semua file berekstensi .pdf
    const pdfFiles = fs
        .readdirSync(docsDir)
        .filter((file) => file.toLowerCase().endsWith(".pdf"));

    if (pdfFiles.length === 0) {
        console.warn(`⚠️  Tidak ditemukan file PDF di dalam: ${docsDir}`);
        console.warn("Taruh file PDF (misal: panduan.pdf, kurikulum.pdf) di folder tersebut.");
        process.exit(0);
    }

    console.log(`📁 Ditemukan ${pdfFiles.length} file PDF untuk diproses:`);
    pdfFiles.forEach((file, idx) => console.log(`   ${idx + 1}. ${file}`));
    console.log("");

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 600,
        chunkOverlap: 100,
        separators: ["\n\n", "\n", " ", ""],
    });

    const allRecords: VectorRecord[] = [];
    let globalChunkId = 1;

    // 3. Loop setiap file PDF
    for (let fileIndex = 0; fileIndex < pdfFiles.length; fileIndex++) {
        const fileName = pdfFiles[fileIndex];
        const fullPath = path.join(docsDir, fileName);

        console.log(`[${fileIndex + 1}/${pdfFiles.length}] Memproses: ${fileName}...`);

        const pages = await loadPdfPages(fullPath);
        console.log(`   ✓ Terbaca ${pages.length} halaman.`);

        let fileChunkCount = 0;

        for (const page of pages) {
            if (!page.text.trim()) continue;
            const splitTexts = await splitter.splitText(page.text);

            for (const text of splitTexts) {
                allRecords.push({
                    id: globalChunkId++,
                    fileName: fileName,
                    page: page.pageNumber,
                    content: text.trim(),
                    embedding: [],
                });
                fileChunkCount++;
            }
        }

        console.log(`   ✓ Dipecah menjadi ${fileChunkCount} chunks.\n`);
    }

    console.log(`📊 Total keseluruhan: ${allRecords.length} chunks dari ${pdfFiles.length} dokumen.`);
    console.log("🧠 Menghitung Vector Embedding secara lokal via CPU...");

    // 4. Hitung embedding untuk semua chunk
    for (let i = 0; i < allRecords.length; i++) {
        process.stdout.write(`   Meng-embed chunk ${i + 1}/${allRecords.length}\r`);
        allRecords[i].embedding = await generateLocalVector(allRecords[i].content);
    }

    console.log("\n💾 Menyimpan semua data vektor ke disk...");
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(allRecords), "utf-8");

    console.log(`✅ Selesai! Seluruh vektor tersimpan di:\n   ${outputFile}\n`);
}

runIngest().catch(console.error);