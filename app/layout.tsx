import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-sans",
});

const themeScript = `
(function(){
  try {
    var key = "class-flow-theme";
    var preference = localStorage.getItem(key);
    if (preference !== "light" && preference !== "dark" && preference !== "system") {
      preference = "system";
    }
    var systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = preference === "system" ? (systemDark ? "dark" : "light") : preference;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (error) {}
})();
`;

export const metadata: Metadata = {
  title: "Class Flow | จัดการรายวิชา",
  description: "ระบบจัดการรายวิชา ตารางเรียน ผู้สอน และสถานที่เรียน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={cn("h-full", "antialiased", "font-sans", notoSansThai.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="class-flow-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        {children}
      </body>
    </html>
  );
}
