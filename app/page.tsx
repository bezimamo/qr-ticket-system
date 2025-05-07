"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react"; // Icon for the alert

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

  // Optional: color classes for customization
  const alertColors = {
    valid: "border-green-500 bg-green-50 text-green-700",
    used: "border-yellow-500 bg-yellow-50 text-yellow-700",
    wrong_event: "border-red-500 bg-red-50 text-red-700",
    invalid_format: "border-red-500 bg-red-50 text-red-700",
  };

  const currentAlertColor = alertColors[status as keyof typeof alertColors] || "";

  return (
    <div className="p-8 min-h-screen bg-blue-50 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">🎟️ Scan Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            id="qr-reader"
            className="w-full border border-gray-300 rounded-md overflow-hidden"
          />

          {result && (
            <Alert className={`mt-6 ${currentAlertColor}`} variant={
              status === "valid" ? "default" : "destructive"
            }>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Result</AlertTitle>
              <AlertDescription className="text-lg font-semibold">
                {result}
              </AlertDescription>
            </Alert>
          )}

          {!scanning && (
            <Button onClick={startScanner} className="mt-6 w-full">
              🔁 Scan Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
