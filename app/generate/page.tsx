'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';

export default function GeneratePage() {
	const router = useRouter();
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState('');
	const [logs, setLogs] = useState<string[]>([]);
	const [success, setSuccess] = useState(false);

	// Ajouter un log avec horodatage
	const addLog = (message: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
	};

	// Fonction pour générer une nouvelle image
	const generateImage = async () => {
		if (isGenerating) return;

		try {
			setIsGenerating(true);
			setError('');
			setSuccess(false);
			addLog("Début de la génération d'une nouvelle image de Vincent...");

			// Appel à l'API
			addLog("Appel de l'API de génération...");
			const response = await fetch('/api/generate', {
				method: 'POST',
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.message || "Erreur lors de la génération de l'image"
				);
			}

			addLog('Image générée avec succès!');
			addLog(`Titre: ${data.data.title}`);
			setSuccess(true);

			// Rafraîchir la page principale dans 2 secondes
			setTimeout(() => {
				router.push('/');
			}, 2000);
		} catch (error) {
			console.error('Erreur de génération:', error);
			setError((error as Error).message);
			addLog(`ERREUR: ${(error as Error).message}`);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className='min-h-screen bg-gray-100 py-12 px-4'>
			<div className='max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden'>
				<div className='p-8'>
					<motion.h1
						className='text-3xl font-bold text-center mb-8'
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}>
						Générateur d'Images de Vincent
					</motion.h1>

					<div className='flex flex-col items-center space-y-6'>
						{/* Bouton de génération */}
						<motion.button
							className={`px-6 py-3 rounded-lg flex items-center space-x-2 text-white font-medium ${
								isGenerating
									? 'bg-gray-400 cursor-not-allowed'
									: 'bg-purple-600 hover:bg-purple-700'
							}`}
							onClick={generateImage}
							disabled={isGenerating}
							whileHover={isGenerating ? {} : { scale: 1.05 }}
							whileTap={isGenerating ? {} : { scale: 0.95 }}>
							{isGenerating ? (
								<>
									<Loader2 className='w-5 h-5 animate-spin' />
									<span>Génération en cours...</span>
								</>
							) : (
								<>
									<ImageIcon className='w-5 h-5' />
									<span>Générer une image de Vincent</span>
								</>
							)}
						</motion.button>

						{/* Indicateurs de statut */}
						{success && (
							<motion.div
								className='bg-green-100 text-green-700 p-4 rounded-lg w-full'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}>
								Image générée avec succès! Redirection vers la page
								d'accueil...
							</motion.div>
						)}

						{error && (
							<motion.div
								className='bg-red-100 text-red-700 p-4 rounded-lg w-full flex items-start space-x-2'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}>
								<AlertTriangle className='w-5 h-5 flex-shrink-0 mt-0.5' />
								<div>
									<p className='font-bold'>Erreur</p>
									<p>{error}</p>
								</div>
							</motion.div>
						)}

						{/* Logs de débogage */}
						<div className='w-full mt-6'>
							<h3 className='font-medium text-gray-700 mb-2'>
								Logs de génération:
							</h3>
							<div className='bg-gray-900 text-gray-200 p-4 rounded-lg font-mono text-sm h-60 overflow-y-auto'>
								{logs.length === 0 ? (
									<p className='text-gray-400 italic'>
										Pas encore de logs...
									</p>
								) : (
									logs.map((log, index) => (
										<div key={index} className='mb-1'>
											{log}
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
