import { z } from "zod";
import { tool } from "@langchain/core/tools";

export const GET_COURSE_INFORMATION = tool(
    async ({ courseName }) => {
        const course = courseName.toLowerCase();

        if (course.includes("pbo") || course.includes("pemrograman berorientasi objek")) {
            return `
Pemrograman Berorientasi Objek
- Kode: IF203
- Bobot: 3 SKS
- Prasyarat: Lulus Algoritma dan Struktur Data.
      `.trim();
        }

        if (course.includes("basis data") || course.includes("database")) {
            return `
Basis Data
- Kode: IF205
- Bobot: 3 SKS
- Prasyarat: Algoritma dan Struktur Data.
- Semester rekomendasi: Semester 4.
      `.trim();
        }

        return "Informasi mata kuliah tidak ditemukan.";
    },
    {
        name: "GET_COURSE_INFORMATION",
        description: "Mengambil informasi detail mata kuliah seperti kode, SKS, prasyarat, dan semester rekomendasi.",
        schema: z.object({
            courseName: z.string().describe("Nama atau kode mata kuliah."),
        }),
    }
);