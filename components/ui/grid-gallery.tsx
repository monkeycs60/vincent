'use client';

import React from 'react';
import Image from 'next/image';
import { Image as ImageType } from '@/app/generated/prisma/index';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface GridGalleryProps {
	images: ImageType[];
}

export default function GridGallery({ images }: GridGalleryProps) {
	// Animation variants pour les éléments de la grille
	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: (i: number) => ({
			opacity: 1,
			y: 0,
			transition: {
				delay: i * 0.1,
				duration: 0.5,
			},
		}),
	};

	if (!images || images.length === 0) {
		return (
			<div className='flex justify-center items-center h-40 w-full bg-gray-100 rounded-lg'>
				<p className='text-gray-500 italic'>
					Pas d&apos;images de Vincent à afficher pour le moment...
				</p>
			</div>
		);
	}

	return (
		<div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
			{images.map((image, index) => (
				<motion.div
					key={image.id}
					className='relative mb-4 group overflow-hidden rounded-xl shadow-md'
					variants={itemVariants}
					initial='hidden'
					animate='visible'
					custom={index}
					whileHover={{
						scale: 1.03,
						transition: { duration: 0.2 },
						boxShadow:
							'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
					}}>
					<div className='relative aspect-[2/3] overflow-hidden'>
						<Image
							src={image.url}
							alt={image.title}
							fill
							className='object-cover transition-transform duration-500 group-hover:scale-105'
							sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
						/>
					</div>
					<div className='absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent'>
						<p className='text-white font-bold italic text-sm md:text-base'>
							{image.title}
						</p>
						<p className='text-white/70 text-xs mt-1 flex items-center gap-1'>
							<Calendar className='h-3 w-3' />
							{new Date(image.createdAt).toLocaleDateString()}
						</p>
					</div>
				</motion.div>
			))}
		</div>
	);
}
