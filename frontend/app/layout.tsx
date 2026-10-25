import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import Ambient from "@/components/Ambient";

export const metadata: Metadata = {
  title: "SkillOra — AI-Powered Resume Intelligence",
  description: "Verified, fact-grounded resume tailoring and an explainable job-fit score, powered by CrewAI and Google ADK.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Ambient />
        {children}
      </body>
    </html>
  );
}
