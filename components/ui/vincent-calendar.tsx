'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Image as ImageType } from '@/app/generated/prisma/index';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	const timelineRef = useRef<HTMLDivElement>(null);

	// Gestionnaire d'événements de souris global
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setMousePosition({ x: e.clientX, y: e.clientY });
		};

		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
		};
	}, []);

	// Fonction pour obtenir les jours de la semaine actuelle, limités à 3 sur mobile
	const getWeekDays = () => {
		const days = [];

		// Sur desktop, afficher les 7 jours de la semaine
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

	return (
		<div className='w-full max-w-6xl mx-auto my-12 md:my-20 px-4'>
			{/* Titre centré */}
			<h2 className='text-2xl md:text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2'>
				<span>La semaine de Vincent</span>
			</h2>

			{/* Timeline artistique */}
			<div className='relative'>
				{/* Ligne de temps */}
				<div className='absolute top-[140px] md:top-[140px] left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-200 z-0'></div>

				{/* Flèches de navigation (visibles uniquement sur desktop) */}
				<>
					<div className='absolute left-0 top-[140px] transform -translate-y-1/2 -translate-x-6 z-10'>
						<motion.button
							onClick={goToPreviousWeek}
							className='p-3 rounded-full bg-white shadow-lg text-indigo-600 hover:text-indigo-800 border border-indigo-100'
							whileHover={{ scale: 1.1, x: -2 }}
							whileTap={{ scale: 0.95 }}>
							<ChevronLeft className='h-5 w-5' />
						</motion.button>
					</div>

					<div className='absolute right-0 top-[140px] transform -translate-y-1/2 translate-x-6 z-10'>
						<motion.button
							onClick={goToNextWeek}
							className='p-3 rounded-full bg-white shadow-lg text-indigo-600 hover:text-indigo-800 border border-indigo-100'
							whileHover={{ scale: 1.1, x: 2 }}
							whileTap={{ scale: 0.95 }}>
							<ChevronRight className='h-5 w-5' />
						</motion.button>
					</div>
				</>

				{/* Conteneur des jours avec padding pour les flèches (ajustement pour mobile) */}
				<div
					ref={timelineRef}
					className='flex justify-between items-start md:px-10 py-6 overflow-x-auto md:overflow-visible'
					style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
					<style jsx global>{`
						/* Cacher la scrollbar pour Chrome, Safari et Opera */
						div::-webkit-scrollbar {
							display: none;
						}
					`}</style>

					{weekDays.map((date) => {
						const image = getImageForDate(date);
						const isToday =
							formatDateForComparison(date) ===
							formatDateForComparison(new Date());
						const dayNameIndex =
							date.getDay() === 0 ? 6 : date.getDay() - 1;
						const dayName = dayNames[dayNameIndex];

						return (
							<div
								key={`day-${date.toISOString()}`}
								className={`
									relative flex flex-col items-center
									${isToday ? 'z-10' : ''}
									min-w-[80px] mx-2 md:mx-2 
								`}>
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
								<div
									className={`
										relative w-20 h-28 md:w-20 md:h-28 rounded-xl overflow-hidden shadow-md 
										${image ? 'cursor-pointer' : 'bg-gray-100 opacity-40'}
										${
											isToday
												? 'shadow-lg shadow-purple-200 border-2 border-indigo-400'
												: 'border border-gray-200'
										}
									`}
									onClick={() => image && openModal(image)}
									onMouseEnter={() => image && setHoveredImage(image)}
									onMouseLeave={() => setHoveredImage(null)}>
									{image ? (
										<Image
											src={image.url}
											alt={
												image.title ||
												`Vincent du ${date.toLocaleDateString()}`
											}
											fill
											className='object-cover'
											sizes='(max-width: 768px) 80px, 100px'
										/>
									) : (
										<div className='h-full w-full flex items-center justify-center'>
											<span className='text-gray-400 text-xs text-center px-1'>
												Pas d&apos;image
											</span>
										</div>
									)}
								</div>

								{/* Point sur la timeline */}
								<div
									className={`
									w-3 h-3 rounded-full mt-4 relative top-[-14px]
									${image ? 'bg-indigo-600' : 'bg-gray-300'}
									${isToday ? 'w-4 h-4' : ''}
								`}></div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Image agrandie au survol */}
			{hoveredImage && (
				<div
					className='fixed z-[9999] bg-white rounded-xl shadow-xl overflow-hidden'
					style={{
						left:
							mousePosition.x < window.innerWidth / 2
								? mousePosition.x + 20
								: mousePosition.x - 280,
						top:
							mousePosition.y < window.innerHeight / 2
								? mousePosition.y + 20
								: mousePosition.y - 300,
						width: '260px',
						pointerEvents: 'none',
					}}>
					<div className='relative w-full h-96 rounded-xl w'>
						<Image
							src={hoveredImage.url}
							alt={hoveredImage.title || 'Image Vincent'}
							fill
							className='object-cover'
							priority
						/>
					</div>
					<div className='p-3 bg-white'>
						<p className='font-bold italic text-sm'>
							{hoveredImage.title}
						</p>
						<p className='text-xs text-gray-500 mt-1'>
							{new Date(hoveredImage.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>
			)}

			{/* Modale pour l'image en plein écran */}
			<ImageModal
				isOpen={isModalOpen}
				image={modalImage}
				onClose={closeModal}
			/>
		</div>
	);
}
