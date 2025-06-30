"use client";

import { ReactNode } from "react";
import { SocketContext } from "@/context/SocketContext";
import socket from "@/lib/socket";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};