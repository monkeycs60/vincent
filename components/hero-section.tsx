'use client';

import React from 'react';
import Image from 'next/image';
import { Image as ImageType } from '@/app/generated/prisma/index';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

interface HeroSectionProps {
	latestImage: ImageType | null;
}

export default function HeroSection({ latestImage }: HeroSectionProps) {
	// Si aucune image n'existe encore
	if (!latestImage) {
		return (
			<div className='min-h-[70vh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200 text-center px-4'>
				<h1 className='text-4xl md:text-6xl font-bold mb-6 text-indigo-800'>
					Vincendrier
				</h1>
				<p className='text-xl md:text-2xl mb-8 max-w-2xl'>
					Aucune image de Vincent n&apos;a encore été générée. Revenez plus
					tard !
				</p>
			</div>
		);
	}

	return (
		<section className='relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-50 to-white'>
			{/* Arrière-plan avec effet de flou */}
			<div className='absolute inset-0 z-0 opacity-10'>
				<Image
					src={latestImage.url}
					alt='Vincent background'
					fill
					className='object-cover'
					priority
				/>
			</div>

			<div className='container mx-auto px-4 py-16 z-10'>
				<motion.div
					className='flex flex-col md:flex-row items-center gap-10'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}>
					{/* Image avec ratio 3:2 (1536:1024) */}
					<motion.div
						className='relative w-full md:w-1/2 aspect-[3/2] rounded-xl overflow-hidden shadow-xl border-4 border-white'
						whileHover={{ scale: 1.02, rotate: -0.5 }}
						transition={{ type: 'spring', stiffness: 300 }}>
						<Image
							src={latestImage.url}
							alt={latestImage.title}
							fill
							className='object-cover'
							priority
							sizes='(max-width: 768px) 100vw, 50vw'
						/>

						{/* Badge "Vincent du jour" */}
						<div className='absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium transform rotate-3 shadow-lg'>
							Vincent du jour
						</div>
					</motion.div>

					{/* Contenu */}
					<div className='w-full md:w-1/2 space-y-7'>
						<motion.div
							className='flex items-center gap-2'
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2, duration: 0.6 }}>
							<Sparkles className='h-9 w-9 text-indigo-500' />
							<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight'>
								Vincent du jour
							</h1>
						</motion.div>

						<motion.div
							className='bg-white p-7 rounded-xl shadow-lg border border-indigo-100'
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.4, duration: 0.6 }}>
							<p className='text-xl md:text-2xl font-bold italic text-gray-800 mb-3'>
								&quot;{latestImage.title}&quot;
							</p>
							<p className='text-gray-500 text-sm font-medium flex items-center gap-1'>
								Généré le{' '}
								{new Date(latestImage.createdAt).toLocaleDateString()}
							</p>
						</motion.div>

						<motion.p
							className='text-gray-700 text-base md:text-lg bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400'
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.6, duration: 0.6 }}>
							Chaque jour à midi, l&apos;IA génère une nouvelle image de
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
				<div className='bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-md'>
					<ChevronDown className='w-6 h-6 text-indigo-600' />
				</div>
			</motion.div>
		</section>
	);
}
