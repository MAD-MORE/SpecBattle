import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpecBattle",
  description: "A cinematic phone specification battle experience.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}