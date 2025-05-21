import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Vincendrier',
	description: 'Une dose quotidienne de Vincent généré par IA',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='fr'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} bg-gradient-to-b from-pink-50 via-indigo-50 to-purple-50`}>
				<header className='py-4 px-6 text-black'>
					<div className='container mx-auto flex justify-center'>
						<Link
							href='/'
							className='font-extrabold text-3xl md:text-4xl tracking-tight flex items-center gap-3  transition-transform duration-300'>
							<div className='relative w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden transform rotate-6 transition-transform'>
								<Image
									src='/vincent/vincentsoze.png'
									alt='Vincent Logo'
									fill
									className='object-cover'
								/>
							</div>
							<span className=' transition-all duration-300'>
								Vincendrier
							</span>
							<Sparkles className='h-5 w-5 text-fuchsia-600 animate-pulse' />
						</Link>
					</div>
				</header>
				{children}
			</body>
		</html>
	);
}
