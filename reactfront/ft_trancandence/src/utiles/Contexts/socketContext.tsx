import { createContext } from "react";

export const socketContext = createContext<WebSocket | null>(null)