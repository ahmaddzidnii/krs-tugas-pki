import fs from "fs";
import path from "path";
import { generateLocalVector } from "./local-embeddings";

export interface VectorRecord {
    id: number;
    fileName: string;
    content: string;
    page: number;
    embedding: number[];
}

export interface SearchResult extends VectorRecord {
    score: number;
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

function dotProduct(vecA: number[], vecB: number[]): number {
    let score = 0;
    for (let i = 0; i < vecA.length; i++) {
        score += vecA[i] * vecB[i];
    }
    return score;
}

export async function searchVectorStore(query: string, topK = 3): Promise<SearchResult[]> {
    const records = loadVectorStore();

    // Hitung vektor query secara lokal via Hugging Face Transformers
    const queryVector = await generateLocalVector(query);

    const scoredResults = records.map((record) => ({
        ...record,
        score: dotProduct(queryVector, record.embedding),
    }));

    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.slice(0, topK);
}