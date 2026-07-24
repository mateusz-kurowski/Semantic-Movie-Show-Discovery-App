import { ThemeProvider } from "@wrksz/themes";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/layout/footer/footer";
import Header from "@/components/layout/header/header";
import Providers from "@/lib/providers";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "ReelFind",
	description:
		"Find your next favorite movie or TV show with ReelFind. Discover, explore, and enjoy a world of entertainment at your fingertips.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Providers>
						<Header />
						{children}
						<Footer />
					</Providers>
				</ThemeProvider>
			</body>
		</html>
	);
}
