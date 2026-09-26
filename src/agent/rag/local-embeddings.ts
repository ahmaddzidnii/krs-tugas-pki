import { pipeline } from "@huggingface/transformers";

let extractorInstance: any = null;

// Model multilingual ringan (~120MB, otomatis di-download ke cache di run pertama)
const MODEL_NAME = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

async function getExtractor() {
    if (!extractorInstance) {
        extractorInstance = await pipeline("feature-extraction", MODEL_NAME, {
            dtype: "fp32",
        });
    }
    return extractorInstance;
}

/**
 * Menghasilkan array angka koordinat (vektor) dari 1 teks
 */
export async function generateLocalVector(text: string): Promise<number[]> {
    const extractor = await getExtractor();
    const output = await extractor(text, {
        pooling: "mean",
        normalize: true, // Normalisasi membuat perhitungan Cosine Similarity secepat Dot Product
    });

    return Array.from(output.data as Float32Array);
}