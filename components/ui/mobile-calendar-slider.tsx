'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Image as ImageType } from '@/app/generated/prisma/index';
import ImageModal from './image-modal';

interface MobileCalendarSliderProps {
	images: ImageType[];
}

export default function MobileCalendarSlider({
	images,
}: MobileCalendarSliderProps) {
	// États pour la modale
	const [modalImage, setModalImage] = useState<ImageType | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const sliderRef = useRef<HTMLDivElement>(null);

	// Fonction pour formater la date en YYYY-MM-DD pour la comparaison
	const formatDateForComparison = (date: Date): string => {
		return date.toISOString().split('T')[0];
	};

	// Créer un tableau avec toutes les dates depuis la première image
	const getAllDatesSinceFirstImage = () => {
		if (images.length === 0) return [];

		// Trier les images par date (de la plus ancienne à la plus récente)
		const sortedImages = [...images].sort(
			(a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		);

		// Obtenir la date de la première et de la dernière image
		const firstImageDate = new Date(sortedImages[0].createdAt);
		const lastImageDate = new Date();
		lastImageDate.setHours(0, 0, 0, 0);

		// Calculer la différence en jours
		const daysDifference = Math.ceil(
			(lastImageDate.getTime() - firstImageDate.getTime()) /
				(1000 * 60 * 60 * 24)
		);

		// Créer un tableau avec toutes les dates
		const allDates = [];
		for (let i = 0; i <= daysDifference; i++) {
			const date = new Date(lastImageDate);
			date.setDate(lastImageDate.getDate() - i);
			allDates.push(date);
		}

		// Inverser pour avoir les dates dans l'ordre chronologique (de la plus ancienne à la plus récente)
		return allDates.reverse();
	};

	// Fonction pour vérifier si une image existe pour une date donnée
	const getImageForDate = (date: Date): ImageType | null => {
		const dateStr = formatDateForComparison(date);
		return (
			images.find(
				(img) =>
					formatDateForComparison(new Date(img.createdAt)) === dateStr
			) || null
		);
	};

	// Fonction pour ouvrir la modale avec l'image sélectionnée
	const openModal = (image: ImageType) => {
		setModalImage(image);
		setIsModalOpen(true);
	};

	// Fonction pour fermer la modale
	const closeModal = () => {
		setIsModalOpen(false);
	};

	// Faire défiler jusqu'à la date d'aujourd'hui au chargement
	useEffect(() => {
		if (sliderRef.current) {
			// Laisser le temps au DOM de se mettre à jour
			setTimeout(() => {
				if (sliderRef.current) {
					sliderRef.current.scrollLeft = sliderRef.current.scrollWidth;
				}
			}, 100);
		}
	}, []);

	// Noms courts des jours de la semaine
	const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
	const allDates = getAllDatesSinceFirstImage();

	return (
		<div className='w-full my-8'>
			<h2 className='text-2xl font-bold text-center mb-6'>
				<span>La semaine de Vincent</span>
			</h2>

			{/* Instructions pour le défilement */}
			<div className='text-center text-xs text-gray-500 mb-2 animate-pulse'>
				← Faites glisser pour explorer toutes les images →
			</div>

			{/* Conteneur pour le défilement horizontal */}
			<div className='relative overflow-hidden'>
				{/* Ligne de temps */}
				<div className='absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-200 transform -translate-y-1/2 z-0'></div>

				{/* Conteneur avec défilement */}
				<div
					ref={sliderRef}
					className='flex overflow-x-auto pb-8 px-4 gap-6 snap-x snap-mandatory hide-scrollbar'
					style={{ scrollbarWidth: 'none' }}>
					<style jsx global>{`
						.hide-scrollbar::-webkit-scrollbar {
							display: none;
						}
						.hide-scrollbar {
							-ms-overflow-style: none;
							scrollbar-width: none;
						}
					`}</style>

					{allDates.map((date) => {
						const image = getImageForDate(date);
						const isToday =
							formatDateForComparison(date) ===
							formatDateForComparison(new Date());
						const dayNameIndex =
							date.getDay() === 0 ? 6 : date.getDay() - 1;
						const dayName = dayNames[dayNameIndex];

						return (
							<div
								key={date.toISOString()}
								className='flex-none w-[65vw] max-w-[250px] snap-center flex flex-col items-center'>
								{/* Date */}
								<div className='mb-4 text-center'>
									<div
										className={`
											mx-auto mb-1 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
											${isToday ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}
										`}>
										{date.getDate()}
									</div>
									<p className='text-sm text-gray-500'>
										{dayName}{' '}
										{date.toLocaleDateString('fr-FR', {
											month: 'short',
										})}
									</p>
								</div>

								{/* Image */}
								<div
									className={`
										relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg 
										${isToday ? 'border-2 border-indigo-400' : 'border border-gray-200'}
										${image ? 'cursor-pointer' : 'bg-gray-100'}
									`}
									onClick={() => image && openModal(image)}>
									{image ? (
										<Image
											src={image.url}
											alt={
												image.title ||
												`Vincent du ${date.toLocaleDateString()}`
											}
											fill
											className='object-cover'
											sizes='(max-width: 768px) 65vw, 250px'
										/>
									) : (
										<div className='flex items-center justify-center h-full'>
											<p className='text-sm text-gray-400 px-2 text-center'>
												Pas d&apos;image pour ce jour
											</p>
										</div>
									)}
								</div>

								{/* Point sur la timeline */}
								<div
									className={`
										w-3 h-3 rounded-full mt-4
										${image ? 'bg-indigo-600' : 'bg-gray-300'}
										${isToday ? 'w-4 h-4' : ''}
									`}></div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Modale pour l'image en plein écran */}
			<ImageModal
				isOpen={isModalOpen}
				image={modalImage}
				onClose={closeModal}
			/>
		</div>
	);
}
