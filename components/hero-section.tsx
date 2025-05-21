'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Image as ImageType } from '@/app/generated/prisma/index';
import { motion } from 'framer-motion';
import { Grid2X2, Calendar, Heart, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
	latestImage: ImageType | null;
}

export default function HeroSection({ latestImage }: HeroSectionProps) {
	// Si aucune image n'existe encore
	if (!latestImage) {
		return (
			<div className='min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 text-center px-4'>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						type: 'spring',
						stiffness: 260,
						damping: 20,
					}}
					className='bg-white p-8 rounded-3xl shadow-xl max-w-md'>
					<h1 className='text-3xl md:text-5xl font-extrabold mb-5 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-transparent bg-clip-text'>
						Vincendrier
					</h1>
					<p className='text-lg md:text-xl mb-6 max-w-2xl text-gray-600'>
						Aucune image de Vincent n&apos;a encore été générée. Revenez
						plus tard !
					</p>
				</motion.div>
			</div>
		);
	}

	return (
		<section className='relative w-full py-4 overflow-hidden max-w-7xl mx-auto'>
			<div className='container mx-auto px-4 relative z-10'>
				<div className='flex flex-col md:flex-row md:items-center gap-8 md:gap-12 md:mx-auto md:justify-between'>
					{/* Image à gauche avec dimensions réduites */}
					<motion.div
						className='md:w-auto md:flex-shrink-0'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						whileHover={{ scale: 1.02, rotate: 1 }}
						whileTap={{ scale: 0.98 }}>
						<div className='relative w-full aspect-[2/3] md:h-[600px] rounded-2xl overflow-hidden border-6 border-white'>
							<Image
								src={latestImage.url}
								alt={latestImage.title}
								fill
								className='object-cover'
								priority
								sizes='(max-width: 768px) 100vw, 460px'
							/>

							{/* Badge du jour plus fun et animé */}
							<motion.div
								className='absolute top-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg'
								animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
								transition={{
									duration: 2,
									repeat: Infinity,
									repeatType: 'reverse',
								}}>
								Vincent du jour
							</motion.div>
						</div>
					</motion.div>

					{/* Contenu à droite */}
					<div className='w-1/2 flex flex-col justify-center space-y-6'>
						{/* Titre principal avec effet de gradient */}
						<motion.h1
							className='text-3xl md:text-4xl lg:text-6xl font-extrabold text-left leading-tight bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-transparent bg-clip-text'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.7 }}>
							Chaque jour, une IA torture Vincent.
						</motion.h1>

						{/* Sous-titre avec le nom de l'image */}
						<motion.div
							className='bg-white p-5 rounded-xl shadow-lg border-2 border-purple-100'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3, duration: 0.6 }}
							whileHover={{
								y: -4,
								boxShadow: '0 12px 25px rgba(131,56,236,0.2)',
							}}>
							<div className='flex items-start gap-3'>
								<span className='text-2xl'>🗣️</span>
								<div>
									<h2 className='text-xl font-bold text-gray-800 mb-1'>
										&quot;{latestImage.title}&quot;
									</h2>
									<p className='text-gray-500 text-xs flex items-center gap-1'>
										<Calendar className='h-3 w-3' />
										Généré le{' '}
										{new Date(
											latestImage.createdAt
										).toLocaleDateString()}
									</p>
								</div>
							</div>
						</motion.div>

						{/* Pourquoi Vincent - section plus chaleureuse */}
						<motion.div
							className='bg-white p-5 rounded-xl shadow-lg border-2 border-pink-100'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.5, duration: 0.6 }}
							whileHover={{
								y: -4,
								boxShadow: '0 12px 25px rgba(236,72,153,0.2)',
							}}>
							<div className='flex items-start gap-3'>
								<span className='text-2xl'>❓</span>
								<div>
									<h3 className='text-lg font-bold mb-2 flex items-center gap-2'>
										Pourquoi Vincent ?
										<Heart className='h-4 w-4 text-pink-500 fill-pink-500' />
									</h3>
									<p className='text-gray-700 text-sm'>
										Vincent n&apos;a rien demandé, mais le monde doit
										voir ça. Un développeur râleur devenu malgré lui
										la star d&apos;un délire généré par IA.
									</p>
								</div>
							</div>
						</motion.div>

						{/* CTAs plus ludiques */}
						<motion.div
							className='flex flex-col sm:flex-row gap-3 justify-center'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.7, duration: 0.6 }}>
							<Link
								href='#gallery'
								className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-5 rounded-lg text-center shadow-lg transition-all flex items-center justify-center gap-2 group text-sm md:w-2/3 mx-auto'>
								<Grid2X2 className='w-4 h-4' />
								<span>Explorer la galerie</span>
								<ArrowRight className='w-0 h-4 opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-300' />
							</Link>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}
