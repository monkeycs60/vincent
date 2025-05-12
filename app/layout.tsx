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
				className={`${geistSans.variable} ${geistMono.variable} bg-purple-100`}>
				<header className='bg-purple-900 text-white p-4'>
					<div className='container mx-auto flex justify-between items-center'>
						<Link href='/' className='text-xl font-bold'>
							Vincendrier
						</Link>

						<nav>
							<ul className='flex space-x-4'>
								<li>
									<Link
										href='/generate'
										className='px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md transition-colors'>
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
