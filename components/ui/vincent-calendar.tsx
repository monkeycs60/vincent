'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Image as ImageType } from '@/app/generated/prisma/index';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import ImageModal from './image-modal';

interface VincentCalendarProps {
	images: ImageType[];
}

export default function VincentCalendar({ images }: VincentCalendarProps) {
	// État pour le premier jour de la semaine affichée
	const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
		const now = new Date();
		const dayOfWeek = now.getDay();
		const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi comme premier jour (0 = dimanche en JS)
		const monday = new Date(now);
		monday.setDate(now.getDate() - diff);
		monday.setHours(0, 0, 0, 0);
		return monday;
	});

	// États pour l'image survolée et la modale
	const [hoveredImage, setHoveredImage] = useState<ImageType | null>(null);
	const [modalImage, setModalImage] = useState<ImageType | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Fonction pour obtenir les jours de la semaine actuelle
	const getWeekDays = () => {
		const days = [];
		for (let i = 0; i < 7; i++) {
			const day = new Date(currentWeekStart);
			day.setDate(currentWeekStart.getDate() + i);
			days.push(day);
		}
		return days;
	};

	// Semaine actuelle
	const weekDays = getWeekDays();

	// Fonction pour naviguer vers la semaine précédente
	const goToPreviousWeek = () => {
		const newStart = new Date(currentWeekStart);
		newStart.setDate(currentWeekStart.getDate() - 7);
		setCurrentWeekStart(newStart);
	};

	// Fonction pour naviguer vers la semaine suivante
	const goToNextWeek = () => {
		const newStart = new Date(currentWeekStart);
		newStart.setDate(currentWeekStart.getDate() + 7);
		setCurrentWeekStart(newStart);
	};

	// Fonction pour formater la date en YYYY-MM-DD pour la comparaison
	const formatDateForComparison = (date: Date): string => {
		return date.toISOString().split('T')[0];
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

	// Noms courts des jours de la semaine
	const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

	// Mois actuellement affiché (pour l'en-tête)
	const currentMonthYear = new Intl.DateTimeFormat('fr-FR', {
		month: 'long',
		year: 'numeric',
	}).format(weekDays[3]); // Milieu de la semaine pour déterminer le mois principal

	return (
		<div className='w-full max-w-6xl mx-auto my-12 px-4'>
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-2xl md:text-3xl font-bold flex items-center gap-2'>
					<Calendar className='h-6 w-6 text-indigo-600' />
					<span>La Semaine de Vincent</span>
				</h2>
				<div className='flex items-center gap-2'>
					<motion.button
						onClick={goToPreviousWeek}
						className='p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors'
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}>
						<ChevronLeft className='h-5 w-5' />
					</motion.button>
					<span className='font-medium text-gray-700 min-w-32 text-center'>
						{currentMonthYear}
					</span>
					<motion.button
						onClick={goToNextWeek}
						className='p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors'
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}>
						<ChevronRight className='h-5 w-5' />
					</motion.button>
				</div>
			</div>

			{/* Timeline artistique */}
			<div className='relative'>
				{/* Ligne de temps */}
				<div className='absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-200 transform -translate-y-1/2 z-0'></div>

				{/* Flèche gauche */}
				<div className='absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 z-10'>
					<motion.button
						onClick={goToPreviousWeek}
						className='p-3 rounded-full bg-white shadow-lg text-indigo-600 hover:text-indigo-800 border border-indigo-100'
						whileHover={{ scale: 1.1, x: -2 }}
						whileTap={{ scale: 0.95 }}>
						<ChevronLeft className='h-5 w-5' />
					</motion.button>
				</div>

				{/* Flèche droite */}
				<div className='absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 z-10'>
					<motion.button
						onClick={goToNextWeek}
						className='p-3 rounded-full bg-white shadow-lg text-indigo-600 hover:text-indigo-800 border border-indigo-100'
						whileHover={{ scale: 1.1, x: 2 }}
						whileTap={{ scale: 0.95 }}>
						<ChevronRight className='h-5 w-5' />
					</motion.button>
				</div>

				{/* Conteneur des jours avec padding pour les flèches */}
				<div className='flex justify-between items-end px-10 py-6 overflow-x-auto'>
					{weekDays.map((date, index) => {
						const image = getImageForDate(date);
						const isToday =
							formatDateForComparison(date) ===
							formatDateForComparison(new Date());
						const dayName = dayNames[index];

						return (
							<motion.div
								key={`day-${date.toISOString()}`}
								className={`
									relative flex flex-col items-center group
									${isToday ? 'scale-110 z-10' : ''}
									min-w-[80px] mx-1 md:mx-2
								`}
								whileHover={
									image
										? { scale: 1.2, zIndex: 20 }
										: { scale: 1.05, zIndex: 20 }
								}
								transition={{
									type: 'spring',
									stiffness: 300,
									damping: 20,
								}}>
								{/* Jour du mois */}
								<div
									className={`
									mb-2 font-bold text-lg rounded-full w-10 h-10 flex items-center justify-center
									${
										isToday
											? 'bg-indigo-600 text-white shadow-md shadow-indigo-300'
											: 'bg-white text-gray-700 border border-gray-200'
									}
								`}>
									{date.getDate()}
								</div>

								{/* Jour de la semaine */}
								<div className='text-xs text-gray-500 mb-2'>
									{dayName}
								</div>

								{/* Image du jour */}
								<motion.div
									className={`
										relative w-16 h-24 md:w-20 md:h-28 rounded-xl overflow-hidden shadow-md 
										${image ? 'cursor-pointer' : 'bg-gray-100 opacity-40'}
										${
											isToday
												? 'shadow-lg shadow-purple-200 border-2 border-indigo-400'
												: 'border border-gray-200'
										}
									`}
									transition={{ duration: 0.2 }}
									onClick={() => image && openModal(image)}>
									{image ? (
										<Image
											src={image.url}
											alt={
												image.title ||
												`Vincent du ${date.toLocaleDateString()}`
											}
											fill
											className='object-cover transition-transform duration-300 group-hover:scale-105'
											sizes='(max-width: 768px) 80px, 100px'
										/>
									) : (
										<div className='h-full w-full flex items-center justify-center'>
											<span className='text-gray-400 text-xs text-center px-1'>
												Pas d&apos;image
											</span>
										</div>
									)}
								</motion.div>

								{/* Point sur la timeline */}
								<div
									className={`
									w-3 h-3 rounded-full mt-4
									${image ? 'bg-indigo-600' : 'bg-gray-300'}
									${isToday ? 'w-4 h-4 mt-3.5' : ''}
								`}></div>
							</motion.div>
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
