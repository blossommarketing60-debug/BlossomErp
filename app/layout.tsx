import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Blossom School ERP",description:"Secure fee management for Blossom Kindergarten Senior Sec. School, Banswara."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
