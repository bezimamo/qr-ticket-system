"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import QrScanner from "@/components/QrScanner";

export default function Home() {
  const validateTicket = useMutation(api.validateTicket.validateTicket);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const handleScan = async (ticketId: string) => {
    try {
      const response = await validateTicket({
        ticketId,
        eventId: "event123", // Replace with your actual event ID
      });

      setMessage(response.message);
      setStatus(response.status === "valid" ? "success" : "error");
    } catch (error: any) {
      console.error("Validation error:", error);
      setMessage("An error occurred while validating the ticket.");
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 py-10 bg-gradient-to-br from-gray-100 to-gray-300">
      <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span role="img" aria-label="ticket">🎟️</span> QR Ticket Scanner
      </h1>

      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 border border-gray-300">
        <QrScanner onScan={handleScan} />
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-center font-medium w-full max-w-md transition-all duration-300 ${
            status === "success"
              ? "text-black bg-green-100 border border-green-300"
              : "text-red-700 bg-red-100 border border-red-300"
          }`}
        >
          {message}
        </div>
      )}
    </main>
  );
}
