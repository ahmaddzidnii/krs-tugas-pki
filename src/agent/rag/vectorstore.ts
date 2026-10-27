import fs from "fs";
import path from "path";
import { generateLocalVector } from "./local-embeddings";

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
    content: string;
    page: number;
    metadata?: DocMetadata;
    embedding: number[];
}

export interface SearchResult extends VectorRecord {
    score: number;
}

export interface StudentContextFilter {
    jenjang?: string;    // Contoh: "S1" | "S2"
    fakultas?: string;   // Contoh: "FST"
    prodi?: string;      // Contoh: "TIF" | "Informatika"
    kategori?: string;   // Contoh: "AKADEMIK" | "KRS" | "SKRIPSI"
}

export interface SearchOptions {
    topK?: number;
    minScore?: number;
    filter?: StudentContextFilter;
}

const VECTOR_STORE_FILE = path.join(
    process.cwd(),
    "data/vectorstore/academic_vectors.json"
);

let memoryStoreCache: VectorRecord[] | null = null;

function loadVectorStore(): VectorRecord[] {
    if (memoryStoreCache) return memoryStoreCache;

    if (!fs.existsSync(VECTOR_STORE_FILE)) {
        throw new Error(
            `File vector store belum ada di '${VECTOR_STORE_FILE}'. Jalankan 'npm run ingest' terlebih dahulu.`
        );
    }

    const rawData = fs.readFileSync(VECTOR_STORE_FILE, "utf-8");
    memoryStoreCache = JSON.parse(rawData) as VectorRecord[];
    return memoryStoreCache;
}

// Fallback jika file JSON lama belum memiliki field metadata
function parseMetadataFromFileName(fileName: string): DocMetadata {
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

function dotProduct(vecA: number[], vecB: number[]): number {
    let score = 0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
        score += vecA[i] * vecB[i];
    }
    return score;
}

export async function searchVectorStore(
    query: string,
    options: SearchOptions = {}
): Promise<SearchResult[]> {
    const { topK = 3, minScore = 0.58, filter } = options;

    let records = loadVectorStore();

    // 1. Pre-filtering berdasarkan profil mahasiswa (Jenjang, Fakultas, Prodi)
    if (filter) {
        records = records.filter((record) => {
            const meta = record.metadata ?? parseMetadataFromFileName(record.fileName);

            // Filter jenjang (mahasiswa S1 tidak membaca pedoman S2)
            if (filter.jenjang && meta.jenjang !== "ALL" && meta.jenjang !== filter.jenjang) {
                return false;
            }

            // Filter fakultas (mahasiswa FST tidak membaca pedoman FISHUM, FDK, dll)
            if (filter.fakultas && meta.fakultas !== "ALL") {
                const isMatch = filter.fakultas.toUpperCase().includes(meta.fakultas.toUpperCase());
                if (!isMatch) return false;
            }

            // Filter prodi jika dokumen spesifik prodi tertentu
            if (filter.prodi && meta.prodi !== "ALL") {
                const isProdiMatch = filter.prodi.toUpperCase().includes(meta.prodi.toUpperCase());
                if (!isProdiMatch) return false;
            }

            // Filter kategori dokumen jika ditentukan
            if (filter.kategori && meta.kategori !== "UMUM" && meta.kategori !== filter.kategori) {
                return false;
            }

            return true;
        });
    }

    // 2. Hitung vektor query via CPU/Transformers lokal
    const queryVector = await generateLocalVector(query);

    // 3. Kalkulasi similarity score dan saring nilai di bawah threshold
    const scoredResults: SearchResult[] = [];
    for (const record of records) {
        const score = dotProduct(queryVector, record.embedding);
        if (score >= minScore) {
            scoredResults.push({
                ...record,
                score,
            });
        }
    }

    // 4. Urutkan dari skor tertinggi ke terendah
    scoredResults.sort((a, b) => b.score - a.score);

    // 5. Deduplikasi: Hanya ambil 1 chunk terbaik dari setiap file
    const seenFiles = new Set<string>();
    const uniqueResults: SearchResult[] = [];

    for (const result of scoredResults) {
        if (!seenFiles.has(result.fileName)) {
            uniqueResults.push(result);
            seenFiles.add(result.fileName);
        }
        if (uniqueResults.length >= topK) break;
    }

    return uniqueResults;
}