"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ScanPage() {
  const [result, setResult] = useState("");
  const [status, setStatus] = useState(""); // valid, used, wrong_event, invalid_format
  const [scanning, setScanning] = useState(true);
  const validateTicket = useMutation(api.validateTicket.validateTicket);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannedRef = useRef(false);

  const startScanner = () => {
    scannedRef.current = false;
    setResult("");
    setStatus("");
    setScanning(true);

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      async (decodedText: string) => {
        if (scannedRef.current) return;
        scannedRef.current = true;

        const [ticketId, eventId] = decodedText.split(":");
        if (!ticketId || !eventId) {
          setResult("❌ Invalid QR code format");
          setStatus("invalid_format");
          return;
        }

        const response = await validateTicket({ ticketId, eventId });

        if (response.status === "valid") {
          setResult("✅ Ticket is valid");
          setStatus("valid");
        } else if (response.status === "used") {
          setResult("⚠️ Ticket already used");
          setStatus("used");
        } else if (response.status === "wrong_event") {
          setResult("❌ Wrong event");
          setStatus("wrong_event");
        } else {
          setResult("❌ Invalid ticket");
          setStatus("invalid_format");
        }

        await scanner.clear();
        scannerRef.current = null;
        setScanning(false);
      },
      (error) => {
        console.warn(`QR scan error: ${error}`);
      }
    );

    scannerRef.current = scanner;
  };

  useEffect(() => {
    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [validateTicket]);

  // Color based on status
  const colorClass = {
    valid: "text-green-600",
    used: "text-yellow-600",
    wrong_event: "text-red-600",
    invalid_format: "text-red-600",
  }[status] || "text-gray-700";

  return (
    <div className="p-8 min-h-screen bg-blue-400 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🎟️ Scan Ticket</h1>
      <div
        id="qr-reader"
        className="w-full max-w-sm border-2 border-gray-300 rounded-lg overflow-hidden"
      />
      <p className={`mt-6 text-xl font-medium ${colorClass}`}>{result}</p>

      {!scanning && (
        <button
          onClick={startScanner}
          className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-100"
        >
          🔁 Scan Again
        </button>
      )}
    </div>
  );
}
