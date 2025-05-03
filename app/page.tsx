"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ScanPage() {
  const [result, setResult] = useState("");
  const validateTicket = useMutation(api.validateTicket.validateTicket);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    // Unified handler for both camera and file scan success
    const handleScanSuccess = async (decodedText: string) => {
      console.log("Decoded text: ", decodedText);
    
      // Expecting format: "ticket123:event456"
      const [ticketId, eventId] = decodedText.split(":");
    
      if (!ticketId || !eventId) {
        setResult("❌ Invalid QR code format");
        return;
      }
    
      const response = await validateTicket({
        ticketId,
        eventId,
      });
    
      if (response.status === "valid") setResult("✅ Ticket is valid");
      else if (response.status === "used") setResult("⚠️ Ticket already used");
      else if (response.status === "wrong_event") setResult("❌ Wrong event");
      else setResult("❌ Invalid ticket");
    };
    

    scanner.render(
      handleScanSuccess,
      (error) => {
        console.warn(`QR scan error: ${error}`);
      }
    );

    return () => {
      scanner.clear();
    };
  }, [validateTicket]);

  return (
    <div className="p-8 min-h-screen bg-blue-400 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🎟️ Scan Ticket</h1>
      <div
        id="qr-reader"
        className="w-full max-w-sm border-2 border-gray-300 rounded-lg overflow-hidden"
      />
      <p className="mt-6 text-xl text-gray-700 font-medium">{result}</p>
    </div>
  );
}