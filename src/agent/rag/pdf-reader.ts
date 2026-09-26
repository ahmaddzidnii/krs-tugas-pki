import fs from "fs";
import { PDFParse } from "pdf-parse";

export interface PdfChunkPage {
    text: string;
    pageNumber: number;
}

function cleanPageText(text: string): string {
    return text
        .replace(/\u0000/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function shouldSkipPage(text: string): boolean {
    const cleaned = text.trim();

    // Halaman kosong
    if (cleaned.length < 30) return true;

    // Cuma angka / angka romawi
    if (/^[ivxlcdm\d\s]+$/i.test(cleaned)) return true;

    return false;
}

export async function loadPdfPages(
    filePath: string,
): Promise<PdfChunkPage[]> {
    const dataBuffer = fs.readFileSync(filePath);

    const parser = new PDFParse({ data: dataBuffer });

    try {
        const result = await parser.getText();

        return result.pages
            .map((page, index) => ({
                text: cleanPageText(page.text),
                pageNumber: index + 1,
            }))
            .filter((page) => !shouldSkipPage(page.text));
    } finally {
        await parser.destroy();
    }
}