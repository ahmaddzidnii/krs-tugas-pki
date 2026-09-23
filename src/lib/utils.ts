export { cn } from "cn"

export const formatJam = (jam: number) =>
    `${String(Math.floor(jam / 100)).padStart(2, "0")}:${String(jam % 100).padStart(2, "0")}`;