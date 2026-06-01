import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dental Clinic Management",
  description: "Dental Clinic Management SaaS Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
