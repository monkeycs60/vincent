import React from 'react';
import HeroSection from '@/components/hero-section';
import GridGallery from '@/components/ui/grid-gallery';
import { getLatestImage, getAllImages } from '@/lib/images';

export default async function Home() {
	// Récupérer la dernière image et toutes les images générées
	const latestImage = await getLatestImage();
	const allImages = await getAllImages();

	return (
		<main className='flex flex-col items-center min-h-screen '>
			{/* Hero Section avec la dernière image */}
			<HeroSection latestImage={latestImage} />

			{/* Section Galerie */}
			<section
				id='gallery'
				className='w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
				<div className='mb-10 text-center'>
					<h2 className='text-3xl md:text-4xl font-bold mb-3 text-gray-900'>
						La Collection Vincent
					</h2>
					<p className='text-lg text-gray-600 max-w-2xl mx-auto'>
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
					Vincendrier © {new Date().getFullYear()} - Toutes les images
					sont générées par l&apos;IA. Toute ressemblance avec la réalité
					serait purement accidentelle.
				</p>
			</footer>
		</main>
	);
}

// Force le rerendu dynamique de la page à chaque requête
export const dynamic = 'force-dynamic';
