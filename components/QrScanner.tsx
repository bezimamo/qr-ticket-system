"use client";

import { useEffect } from "react";

let Html5QrcodeScanner: any;
if (typeof window !== "undefined") {
  Html5QrcodeScanner = require("html5-qrcode").Html5QrcodeScanner;
}

export default function QrScanner({ onScan }: { onScan: (result: string) => void }) {
  useEffect(() => {
    if (!Html5QrcodeScanner) return;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      (decodedText: string) => {
        onScan(decodedText);

        // Stop camera and scanner
        scanner.clear().then(() => {
          // Extra step: stop all video streams (browser API level)
          const video = document.querySelector("video");
          if (video && video.srcObject) {
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
          }
        });
      },
      (error: string) => {
        console.warn("QR scan error", error);
      }
    );

    return () => {
      // Clear scanner on unmount
      scanner.clear().then(() => {
        const video = document.querySelector("video");
        if (video && video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
        }
      });
    };
  }, [onScan]);

  return <div id="reader" />;
}
