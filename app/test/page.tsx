'use client';

import { useState } from 'react';
import { redirect } from 'next/navigation';

// Protection d'environnement côté serveur
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
	redirect('/');
}

interface GeneratedImage {
	id: string;
	url: string;
	title: string;
	graphicalStyle: string;
	createdAt: string;
}

interface ApiResponse {
	success: boolean;
	data?: GeneratedImage;
	error?: string;
}

export default function TestPage() {
	const [isGenerating, setIsGenerating] = useState(false);
	const [result, setResult] = useState<GeneratedImage | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleGenerateImage = async () => {
		setIsGenerating(true);
		setError(null);
		setResult(null);

		try {
			console.log('Démarrage de la génération d\'image...');
			
			const response = await fetch('/api/test-generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			const data: ApiResponse = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Erreur lors de la génération');
			}

			if (data.success && data.data) {
				setResult(data.data);
				console.log('Image générée avec succès:', data.data);
			} else {
				throw new Error(data.error || 'Réponse invalide');
			}
		} catch (err) {
			console.error('Erreur:', err);
			setError(err instanceof Error ? err.message : 'Erreur inconnue');
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				{/* Header avec badge DEV */}
				<div className="mb-8 text-center">
					<div className="inline-flex items-center gap-2 mb-4">
						<h1 className="text-3xl font-bold text-gray-900">
							Page de Test - Génération Vincent
						</h1>
						<span className="bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
							DEV ONLY
						</span>
					</div>
					<p className="text-gray-600">
						Cette page permet de tester la génération d&apos;images directement sans Trigger.dev
					</p>
				</div>

				{/* Bouton de génération */}
				<div className="text-center mb-8">
					<button
						onClick={handleGenerateImage}
						disabled={isGenerating}
						className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
					>
						{isGenerating ? (
							<span className="flex items-center gap-2">
								<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
										fill="none"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8v8H4z"
									/>
								</svg>
								Génération en cours...
							</span>
						) : (
							'Générer une image de Vincent'
						)}
					</button>
				</div>

				{/* Affichage des erreurs */}
				{error && (
					<div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
						<h3 className="font-bold mb-2">Erreur lors de la génération :</h3>
						<p>{error}</p>
					</div>
				)}

				{/* Affichage du résultat */}
				{result && (
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-2xl font-bold mb-4 text-gray-900">Image générée avec succès !</h2>
						
						<div className="grid md:grid-cols-2 gap-6">
							{/* Image */}
							<div>
								<img
									src={result.url}
									alt={result.title}
									className="w-full h-auto rounded-lg shadow-md"
								/>
							</div>
							
							{/* Métadonnées */}
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-semibold text-gray-700 mb-2">Titre :</h3>
									<p className="text-gray-900">{result.title}</p>
								</div>
								
								<div>
									<h3 className="text-lg font-semibold text-gray-700 mb-2">Style graphique :</h3>
									<p className="text-gray-900">{result.graphicalStyle}</p>
								</div>
								
								<div>
									<h3 className="text-lg font-semibold text-gray-700 mb-2">ID :</h3>
									<p className="text-gray-600 font-mono text-sm">{result.id}</p>
								</div>
								
								<div>
									<h3 className="text-lg font-semibold text-gray-700 mb-2">Créé le :</h3>
									<p className="text-gray-600">
										{new Date(result.createdAt).toLocaleString('fr-FR')}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Informations de développement */}
				<div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<h3 className="text-lg font-semibold text-blue-800 mb-2">
						ℹ️ Informations de développement
					</h3>
					<ul className="text-blue-700 space-y-1 text-sm">
						<li>• Cette page n&apos;est accessible qu&apos;en mode développement</li>
						<li>• Elle teste directement la fonction generateVincentImage()</li>
						<li>• Les logs sont visibles dans la console du navigateur et du serveur</li>
						<li>• L&apos;image générée sera sauvegardée dans la base de données</li>
					</ul>
				</div>
			</div>
		</div>
	);
}