'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Image as ImageType } from '@/app/generated/prisma/index';
import { motion, AnimatePresence } from 'framer-motion';
import ImageModal from './image-modal';

interface VincentCalendarProps {
	images: ImageType[];
}

export default function VincentCalendar({ images }: VincentCalendarProps) {
	// État pour le premier jour de la semaine affichée - on se concentre uniquement sur la semaine actuelle
	const [currentWeekStart] = useState<Date>(() => {
		const now = new Date();
		const dayOfWeek = now.getDay();
		const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi comme premier jour (0 = dimanche en JS)
		const monday = new Date(now);
		monday.setDate(now.getDate() - diff);
		monday.setHours(0, 0, 0, 0);
		return monday;
	});

	// États pour la navigation et la modale
	const [activeIndex, setActiveIndex] = useState(0);
	const [direction, setDirection] = useState(0); // -1: vers le passé, 1: vers le futur
	const [autoplayEnabled, setAutoplayEnabled] = useState(true);
	const [modalImage, setModalImage] = useState<ImageType | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Fonction pour obtenir les jours de la semaine jusqu'à aujourd'hui
	const getWeekDaysUntilToday = () => {
		const days = [];
		const today = new Date();
		const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

		// N'ajouter que les jours jusqu'à aujourd'hui (inclus)
		for (let i = 0; i <= todayIndex; i++) {
			const day = new Date(currentWeekStart);
			day.setDate(currentWeekStart.getDate() + i);
			days.push(day);
		}
		return days;
	};

	// Jours de la semaine jusqu'à aujourd'hui
	const weekDays = getWeekDaysUntilToday();

	// Fonction pour formater la date en YYYY-MM-DD pour la comparaison
	const formatDateForComparison = (date: Date): string => {
		return date.toISOString().split('T')[0];
	};

	// Fonction pour vérifier si une image existe pour une date donnée
	const getImageForDate = (date: Date): ImageType | null => {
		// Trouver une image dont la date de création correspond exactement à la date donnée
		const matchedImage = images.find((img) => {
			const imgDate = new Date(img.createdAt);
			// Créer une date locale sans fuseau horaire pour une comparaison précise
			const imgDateStr = `${imgDate.getFullYear()}-${String(
				imgDate.getMonth() + 1
			).padStart(2, '0')}-${String(imgDate.getDate()).padStart(2, '0')}`;
			const targetDateStr = `${date.getFullYear()}-${String(
				date.getMonth() + 1
			).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
			return imgDateStr === targetDateStr;
		});

		return matchedImage || null;
	};

	// Fonction pour ouvrir la modale avec l'image sélectionnée
	const openModal = (image: ImageType) => {
		setAutoplayEnabled(false);
		setModalImage(image);
		setIsModalOpen(true);
	};

	// Fonction pour fermer la modale
	const closeModal = () => {
		setIsModalOpen(false);
		setAutoplayEnabled(true);
	};

	// Fonction pour aller à l'image suivante (vers le jour plus récent)
	const goToNext = () => {
		setDirection(1); // Direction vers le futur/droit
		setActiveIndex((prevIndex) => (prevIndex + 1) % weekDays.length);
	};

	// Fonction pour aller à l'image précédente (vers le jour plus ancien)
	const goToPrevious = () => {
		setDirection(-1); // Direction vers le passé/gauche
		setActiveIndex(
			(prevIndex) => (prevIndex - 1 + weekDays.length) % weekDays.length
		);
	};

	// Autoplay
	useEffect(() => {
		if (autoplayEnabled && weekDays.length > 1) {
			// Direction alternée pour l'autoplay
			const autoplayNext = () => {
				const currentDate = weekDays[activeIndex];
				const today = new Date();

				// Si on est à la dernière image (aujourd'hui), on revient en arrière
				if (
					formatDateForComparison(currentDate) ===
					formatDateForComparison(today)
				) {
					goToPrevious();
				} else {
					// Sinon on avance
					goToNext();
				}
			};

			autoplayIntervalRef.current = setInterval(autoplayNext, 6000);
		}
		return () => {
			if (autoplayIntervalRef.current) {
				clearInterval(autoplayIntervalRef.current);
			}
		};
	}, [autoplayEnabled, weekDays.length, activeIndex]);

	// Noms des jours de la semaine
	const dayNames = [
		'Lundi',
		'Mardi',
		'Mercredi',
		'Jeudi',
		'Vendredi',
		'Samedi',
		'Dimanche',
	];

	// Formater le mois en français
	const formatMonthFr = (date: Date): string => {
		return date.toLocaleDateString('fr-FR', { month: 'long' });
	};

	// Variantes d'animation basées sur la direction
	const variants = {
		enter: (direction: number) => ({
			x: direction > 0 ? 300 : -300,
			opacity: 0,
		}),
		center: {
			x: 0,
			opacity: 1,
		},
		exit: (direction: number) => ({
			x: direction < 0 ? 300 : -300,
			opacity: 0,
		}),
	};

	return (
		<div className='w-full max-w-4xl mx-auto my-6 md:my-10 px-2'>
			{/* Titre centré avec style plus élégant */}
			<h2 className='text-xl md:text-2xl font-semibold text-center mb-8'>
				<span className='inline-block border-b border-indigo-400 pb-1 px-4'>
					La semaine de Vincent
				</span>
			</h2>

			{/* Carrousel minimaliste avec défilement automatique et transition directionnelle */}
			<div className='relative w-full overflow-hidden min-h-[550px]'>
				<AnimatePresence initial={false} custom={direction} mode='wait'>
					{weekDays.map((date, index) => {
						if (index !== activeIndex) return null;

						const image = getImageForDate(date);
						const isToday =
							formatDateForComparison(date) ===
							formatDateForComparison(new Date());
						const dayNameIndex =
							date.getDay() === 0 ? 6 : date.getDay() - 1;
						const dayName = dayNames[dayNameIndex];

						return (
							<motion.div
								key={`day-${date.toISOString()}`}
								custom={direction}
								variants={variants}
								initial='enter'
								animate='center'
								exit='exit'
								transition={{
									duration: 0.8,
									ease: 'easeInOut',
								}}
								className='absolute w-full'>
								{/* Date stylisée et centrée */}
								<div className='text-center mb-5'>
									<div className='inline-block mb-1'>
										<h3
											className={`font-medium text-base md:text-lg ${
												isToday
													? 'text-indigo-600'
													: 'text-gray-700'
											}`}>
											{dayName} {date.getDate()}{' '}
											{formatMonthFr(date)}
										</h3>
									</div>
								</div>

								{/* Layout flexible pour l'image et la légende */}
								<div className='flex flex-col md:flex-row md:items-start md:gap-8 md:justify-center'>
									{/* Image un peu plus haute */}
									<div
										className={`
											relative w-full max-w-sm mx-auto md:mx-0 overflow-hidden rounded-md
											${image ? 'cursor-pointer shadow-sm border border-gray-100' : 'bg-gray-50'}
										`}
										style={{
											aspectRatio: '2/3',
											height: 'auto',
											maxHeight: '520px',
											minHeight: '350px',
										}}
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
												sizes='(max-width: 768px) 100vw, 400px'
												priority
											/>
										) : (
											<div className='h-full w-full flex items-center justify-center'>
												<span className='text-gray-400 text-sm font-medium text-center px-2'>
													Pas d&apos;image pour ce jour
												</span>
											</div>
										)}
									</div>

									{/* Légende à droite sur desktop, en dessous sur mobile - style amélioré et centré verticalement */}
									{image && (
										<div className='mt-4 md:mt-0 md:max-w-xs md:flex md:flex-col md:justify-center md:h-[520px] text-center md:text-left px-2'>
											<p className='text-base md:text-xl font-bold italic text-gray-800 mb-2 md:mb-3 leading-snug'>
												{image.title}
											</p>
											<p className='text-xs md:text-sm text-gray-500'>
												Généré le{' '}
												{new Date(image.createdAt)
													.toLocaleDateString('fr-FR', {
														day: '2-digit',
														month: '2-digit',
														year: 'numeric',
													})
													.replace(/\//g, '/')}
											</p>
										</div>
									)}
								</div>
							</motion.div>
						);
					})}
				</AnimatePresence>
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
