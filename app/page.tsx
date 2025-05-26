import React from 'react';
import HeroSection from '@/components/hero-section';
import GridGallery from '@/components/ui/grid-gallery';
import { getLatestImage, getAllImages } from '@/lib/images';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
	// Récupérer la dernière image et toutes les images générées
	const latestImage = await getLatestImage();
	const allImages = await getAllImages();

	return (
		<main className='flex flex-col items-center min-h-screen '>
			{/* Hero Section avec la dernière image */}
			<HeroSection latestImage={latestImage} />

			{/* Flèche de défilement vers le bas */}
			<div className='w-full flex justify-center mt-10 mb-8 relative z-10'>
				<Link
					href='#calendar'
					scroll={true}
					className='flex flex-col items-center cursor-pointer transform transition-transform hover:translate-y-1 animate-pulse hover:animate-none'>
					<div className='w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-indigo-50 border border-indigo-100 mb-2'>
						<ChevronDown className='text-indigo-600 w-6 h-6' />
					</div>
					<span className='text-xs text-indigo-600 font-medium'>
						Explorer
					</span>
				</Link>
			</div>

			{/* Section Galerie */}
			<section
				id='gallery'
				className='w-full py-4 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
				<div className='mb-10 text-center'>
					<h2 className='text-2xl md:text-3xl font-bold mb-3 text-gray-900'>
						La Collection Vincent
					</h2>
					<p className='text-gray-600 max-w-2xl mx-auto'>
						Pendant que vous vous tourniez les pouces, l&apos;IA ne vous a
						pas attendu pour capturer chaque jour la substantifique moelle
						de Vincent.
					</p>
				</div>

				{/* Grille d'images */}
				<GridGallery images={allImages} />
			</section>

			{/* Footer */}
			<footer className='w-full py-6 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white text-center shadow-inner'>
				<p className='text-sm opacity-90'>
					Vincendrier © {new Date().getFullYear()} - Toutes les images sont
					générées par l&apos;IA. Toute ressemblance avec la réalité serait
					purement accidentelle.
				</p>
			</footer>
		</main>
	);
}

// Force le rerendu dynamique de la page à chaque requête
export const dynamic = 'force-dynamic';
