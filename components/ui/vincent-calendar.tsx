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

	// Noms des jours de la semaine
	const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

	// Mois actuellement affiché (pour l'en-tête)
	const currentMonthYear = new Intl.DateTimeFormat('fr-FR', {
		month: 'long',
		year: 'numeric',
	}).format(weekDays[3]); // Milieu de la semaine pour déterminer le mois principal

	return (
		<div className='w-full max-w-4xl mx-auto my-12 px-4'>
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-2xl font-bold flex items-center gap-2'>
					<Calendar className='h-6 w-6 text-indigo-600' />
					<span>Calendrier Vincent</span>
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

			{/* Grille du calendrier */}
			<div className='grid grid-cols-7 gap-2 md:gap-4'>
				{/* En-têtes des jours */}
				{dayNames.map((day, index) => (
					<div
						key={`header-${index}`}
						className='text-center font-medium text-gray-700 p-2'>
						{day}
					</div>
				))}

				{/* Cases des jours */}
				{weekDays.map((date, index) => {
					const image = getImageForDate(date);
					const isToday =
						formatDateForComparison(date) ===
						formatDateForComparison(new Date());

					return (
						<motion.div
							key={`day-${date.toISOString()}`}
							className={`
                relative aspect-square border rounded-xl p-2 flex flex-col
                ${
							isToday
								? 'border-indigo-500 bg-indigo-50'
								: 'border-gray-200'
						}
                ${
							image
								? 'cursor-pointer hover:border-indigo-400 transition-colors'
								: 'bg-gray-50'
						}
              `}
							whileHover={image ? { scale: 1.02 } : {}}
							onMouseEnter={() => image && setHoveredImage(image)}
							onMouseLeave={() => setHoveredImage(null)}
							onClick={() => image && openModal(image)}>
							<div className='text-right font-medium text-sm mb-1'>
								{date.getDate()}
							</div>

							{image && (
								<div className='flex-1 relative rounded-md overflow-hidden'>
									<Image
										src={image.url}
										alt={
											image.title ||
											`Vincent du ${date.toLocaleDateString()}`
										}
										fill
										className='object-cover'
										sizes='100px'
									/>
								</div>
							)}
						</motion.div>
					);
				})}
			</div>

			{/* Aperçu au survol */}
			<AnimatePresence>
				{hoveredImage && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						className='fixed bottom-8 right-8 bg-white rounded-xl shadow-2xl overflow-hidden z-30 max-w-sm'>
						<div className='relative w-80 h-96'>
							<Image
								src={hoveredImage.url}
								alt={hoveredImage.title || 'Image Vincent'}
								fill
								className='object-cover'
								priority
							/>
						</div>
						<div className='p-3 bg-white'>
							<p className='font-bold italic'>{hoveredImage.title}</p>
							<p className='text-xs text-gray-500'>
								{new Date(hoveredImage.createdAt).toLocaleDateString()}
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Modale pour l'image en plein écran */}
			<ImageModal
				isOpen={isModalOpen}
				image={modalImage}
				onClose={closeModal}
			/>
		</div>
	);
}
