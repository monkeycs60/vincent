import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

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
	description: 'A daily dose of Vincent',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} bg-neutral-50`}>
				<header className='bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 shadow-md'>
					<div className='container mx-auto flex justify-between items-center'>
						<Link href='/' className='text-2xl font-bold tracking-tight'>
							Vincendrier
						</Link>

						<nav>
							<ul className='flex space-x-4'>
								<li>
									<Link
										href='/generate'
										className='px-5 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors backdrop-blur-sm font-medium'>
										Générer une image
									</Link>
								</li>
							</ul>
						</nav>
					</div>
				</header>
				{children}
			</body>
		</html>
	);
}
