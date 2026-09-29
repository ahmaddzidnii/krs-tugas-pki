import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const getLLM = (apiKey: string) => {
    return new ChatGoogleGenerativeAI({
        model: "gemini-3.5-flash-lite",
        temperature: 0,
        apiKey: apiKey,
    });
};

export const getEmbeddings = (apiKey: string) => {
    return new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        apiKey: apiKey,
    });
};
