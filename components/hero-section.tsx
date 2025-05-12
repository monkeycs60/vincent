import React from 'react';
import Image from 'next/image';
import { Image as ImageType } from '@/app/generated/prisma/index';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

interface HeroSectionProps {
	latestImage: ImageType | null;
}

export default function HeroSection({ latestImage }: HeroSectionProps) {
	// Si aucune image n'existe encore
	if (!latestImage) {
		return (
			<div className='min-h-[70vh] w-full flex flex-col items-center justify-center bg-purple-200 text-center px-4'>
				<h1 className='text-4xl md:text-6xl font-bold mb-6'>Vincendrier</h1>
				<p className='text-xl md:text-2xl mb-8 max-w-2xl'>
					Aucune image de Vincent n'a encore été générée. Revenez plus tard
					!
				</p>
			</div>
		);
	}

	return (
		<section className='relative w-full min-h-[80vh] flex flex-col items-center justify-center overflow-hidden bg-gray-100'>
			{/* Arrière-plan avec effet de flou */}
			<div className='absolute inset-0 z-0 opacity-20 blur-xl'>
				<Image
					src={latestImage.url}
					alt='Vincent background'
					fill
					className='object-cover'
					priority
				/>
			</div>

			<div className='container mx-auto px-4 py-12 z-10'>
				<motion.div
					className='flex flex-col md:flex-row items-center gap-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}>
					{/* Image */}
					<motion.div
						className='relative w-full md:w-1/2 aspect-square rounded-xl overflow-hidden shadow-2xl'
						whileHover={{ scale: 1.02 }}
						transition={{ type: 'spring', stiffness: 300 }}>
						<Image
							src={latestImage.url}
							alt={latestImage.prompt}
							fill
							className='object-cover'
							priority
							sizes='(max-width: 768px) 100vw, 50vw'
						/>
					</motion.div>

					{/* Contenu */}
					<div className='w-full md:w-1/2 space-y-6'>
						<motion.h1
							className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900'
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2, duration: 0.6 }}>
							Vincent du jour
						</motion.h1>

						<motion.div
							className='bg-white p-6 rounded-lg shadow-lg'
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.4, duration: 0.6 }}>
							<p className='text-xl md:text-2xl font-bold italic text-gray-800 mb-3'>
								"{latestImage.punchline}"
							</p>
							<p className='text-gray-600 text-sm'>
								Généré le{' '}
								{new Date(latestImage.createdAt).toLocaleDateString()}
							</p>
						</motion.div>

						<motion.p
							className='text-gray-700 text-base md:text-lg'
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.6, duration: 0.6 }}>
							Chaque jour à midi, l'IA génère une nouvelle image de
							Vincent dans des situations cocasses.
						</motion.p>
					</div>
				</motion.div>
			</div>

			{/* Flèche de défilement */}
			<motion.div
				className='absolute bottom-8 left-1/2 transform -translate-x-1/2'
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1, duration: 0.5 }}
				whileHover={{ y: 5 }}>
				<ArrowDown className='w-8 h-8 text-purple-600 animate-bounce' />
			</motion.div>
		</section>
	);
}
