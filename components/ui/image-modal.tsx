'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageType } from '@/app/generated/prisma/index';

interface ImageModalProps {
	isOpen: boolean;
	image: ImageType | null;
	onClose: () => void;
}

export default function ImageModal({
	isOpen,
	image,
	onClose,
}: ImageModalProps) {
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEsc);
		}

		return () => {
			document.removeEventListener('keydown', handleEsc);
		};
	}, [isOpen, onClose]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}

		return () => {
			document.body.style.overflow = 'auto';
		};
	}, [isOpen]);

	if (!isOpen || !image) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80'
					onClick={onClose}>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						transition={{ type: 'spring', damping: 25 }}
						className='relative bg-white p-2 rounded-xl max-w-4xl mx-auto flex flex-col items-center justify-center'
						onClick={(e) => e.stopPropagation()}
					>
						{/* Bouton de fermeture */}
						<button
							onClick={onClose}
							className='absolute top-3 right-3 z-10 bg-black/70 text-white p-2 rounded-full hover:bg-black transition-colors'>
							<X size={20} />
						</button>

						{/* Image */}
						<div className='relative w-[700px] h-[600px] mt-4 rounded-xl'>
							<Image
								src={image.url}
								alt={image.title || 'Image Vincent'}
								fill
								className='object-contain rounded-xl'
								priority
							/>
						</div>

						{/* Titre et date */}
						<div className='p-4 text-center'>
							<h3 className='text-xl font-bold italic'>{image.title}</h3>
							<p className='text-gray-500 text-sm mt-1'>
								Généré le{' '}
								{new Date(image.createdAt).toLocaleDateString()}
							</p>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
