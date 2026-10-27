import fs from "fs";
import path from "path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { loadPdfPages } from "@/agent/rag/pdf-reader";
import { generateLocalVector } from "@/agent/rag/local-embeddings";

export interface DocMetadata {
    scope: "UNIV" | "FAK" | "PRODI";
    jenjang: "S1" | "S2" | "ALL";
    fakultas: string;
    prodi: string;
    kategori: string;
    tahun?: string;
}

export interface VectorRecord {
    id: number;
    fileName: string;
    page: number;
    metadata: DocMetadata;
    content: string; // Teks ber-header konteks lengkap untuk LLM
    embedding: number[];
}

function parseFileMetadata(fileName: string): DocMetadata {
    const match = fileName.match(/^\[(.*?)\]/);
    if (!match) {
        return {
            scope: "UNIV",
            jenjang: "ALL",
            fakultas: "ALL",
            prodi: "ALL",
            kategori: "UMUM",
        };
    }

    const [scope, jenjang, fakultas, prodi, kategori, tahun] = match[1].split("_");

    return {
        scope: (scope as DocMetadata["scope"]) || "UNIV",
        jenjang: (jenjang as DocMetadata["jenjang"]) || "ALL",
        fakultas: fakultas || "ALL",
        prodi: prodi || "ALL",
        kategori: kategori || "UMUM",
        tahun: tahun === "NODATE" ? undefined : tahun,
    };
}

async function runIngest() {
    const docsDir = path.join(process.cwd(), "data/docs");
    const outputDir = path.join(process.cwd(), "data/vectorstore");
    const outputFile = path.join(outputDir, "academic_vectors.json");

    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
        console.error(`Folder '${docsDir}' kosong. Taruh file PDF terstandarisasi di sana.`);
        process.exit(1);
    }

    const pdfFiles = fs
        .readdirSync(docsDir)
        .filter((file) => file.toLowerCase().endsWith(".pdf"));

    console.log(`📁 Menemukan ${pdfFiles.length} berkas pedoman...`);

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 550,
        chunkOverlap: 80,
        separators: ["\n\n", "\n", ". ", " ", ""],
    });

    const allRecords: VectorRecord[] = [];
    let globalChunkId = 1;

    for (let i = 0; i < pdfFiles.length; i++) {
        const fileName = pdfFiles[i];
        const meta = parseFileMetadata(fileName);
        const fullPath = path.join(docsDir, fileName);

        console.log(`[${i + 1}/${pdfFiles.length}] Memproses: ${fileName}`);
        const pages = await loadPdfPages(fullPath);

        let fileChunkCount = 0;

        for (const page of pages) {
            if (!page.text.trim()) continue;

            const chunks = await splitter.splitText(page.text);

            for (const text of chunks) {
                // Header konteks disuntikkan langsung agar embedding akurat terhadap scope
                const contextualHeader = [
                    `[DOKUMEN RESMI AKADEMIK]`,
                    `Kategori: ${meta.kategori} | Jenjang: ${meta.jenjang}`,
                    `Fakultas: ${meta.fakultas} | Prodi: ${meta.prodi} ${meta.tahun ? `| Tahun: ${meta.tahun}` : ""}`,
                    `Halaman: ${page.pageNumber}`,
                ].join("\n");

                const fullContent = `${contextualHeader}\n\n${text.trim()}`;

                allRecords.push({
                    id: globalChunkId++,
                    fileName,
                    page: page.pageNumber,
                    metadata: meta,
                    content: fullContent,
                    embedding: [],
                });

                fileChunkCount++;
            }
        }
        console.log(`   ✓ ${fileChunkCount} chunks tercipta.`);
    }

    console.log(`\n🧠 Memulai generate embeddings (${allRecords.length} total chunks)...`);

    for (let i = 0; i < allRecords.length; i++) {
        process.stdout.write(`   Embedding chunk: ${i + 1}/${allRecords.length}\r`);
        // Model meng-embed konten yang sudah punya identitas dokumen lengkap
        allRecords[i].embedding = await generateLocalVector(allRecords[i].content);
    }

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(allRecords), "utf-8");

    console.log(`\n\n✅ Selesai! Data vector lengkap disimpan di: ${outputFile}\n`);
}

runIngest().catch(console.error);