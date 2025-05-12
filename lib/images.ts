import { put } from '@vercel/blob';
import prisma from './prisma';
import { experimental_generateImage as generateImage, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

/**
 * Génère un titre créatif pour l'image
 */
async function generateCreativeTitle() {
	const { text } = await generateText({
		model: google('gemini-2.0-flash'),
		prompt:
			"Génère un titre créatif pour une image humoristique mettant en scène Vincent dans une situation comique et dans un univers riche (Ghibli, Tintin, Mars, manga etc.). Format: 'Vincent dans [contexte insolite] [situation comique]'. Exemple: 'Vincent dans l'univers de Star Wars débat avec Yoda sur la supériorité du C++'",
		temperature: 0.8,
	});

	return text.trim();
}

/**
 * Analyse les styles des images précédentes pour éviter les répétitions
 */
async function analyzeExistingStyles() {
	const existingImages = await prisma.image.findMany({
		orderBy: { createdAt: 'desc' },
		take: 10,
		select: { prompt: true },
	});

	if (existingImages.length === 0) {
		return "Pas d'images précédentes";
	}

	const { text } = await generateText({
		model: google('gemini-2.0-flash'),
		prompt: `Analyse ces prompts d'images: "${existingImages
			.map((img) => img.prompt)
			.join(
				'", "'
			)}". Identifie les styles artistiques déjà utilisés et suggère 3 styles originaux différents à explorer. Réponds uniquement avec la liste des styles à éviter suivie de la liste des 3 suggestions.`,
	});

	return text.trim();
}

/**
 * Génère une nouvelle image avec l'IA et l'enregistre dans Vercel Blob
 */
export async function generateVincentImage() {
	try {
		// Générer un titre créatif
		const title = await generateCreativeTitle();

		// Analyser les styles existants et en proposer de nouveaux
		const styleAnalysis = await analyzeExistingStyles();

		// Générer un prompt complet pour l'image
		const { text: fullPrompt } = await generateText({
			model: google('gemini-2.0-flash'),
			prompt: `Crée un prompt détaillé pour générer une image humoristique et professionnelle basée sur ce titre: "${title}". 
			Voici l'analyse des styles précédents: "${styleAnalysis}".
			Le prompt doit décrire précisément Vincent (un développeur senior avec lunettes, dans la cinquantaine, vêtu de noir) dans une situation qui correspond au titre, avec un style artistique original qui n'est pas dans la liste des styles à éviter.
			Ne mentionne pas le titre directement dans le prompt, transforme-le en description visuelle.`,
		});

		// Générer une punchline sarcastique pour accompagner l'image
		const { text: punchline } = await generateText({
			model: google('gemini-1.5-pro'),
			prompt: `Crée une punchline sarcastique courte (max 100 caractères) que Vincent pourrait dire, en lien avec ce titre: "${title}". La punchline doit être cynique, technique et faire référence au monde du développement.`,
			temperature: 0.7,
		});

		// Générer l'image avec le prompt élaboré
		const { image } = await generateImage({
			model: openai.image('gpt-image-1'),
			prompt: fullPrompt,
			aspectRatio: '16:9',
		});

		// Enregistrement dans Vercel Blob
		const buffer = Buffer.from(image.uint8Array);
		const blob = await put(`vincent-${Date.now()}.png`, buffer, {
			access: 'public',
		});

		// Enregistrement des métadonnées dans la base de données
		const newImage = await prisma.image.create({
			data: {
				url: blob.url,
				prompt: fullPrompt,
				punchline,
				title,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		return newImage;
	} catch (error) {
		console.error("Erreur lors de la génération de l'image:", error);
		throw error;
	}
}

/**
 * Récupère la dernière image générée
 */
export async function getLatestImage() {
	const latestImage = await prisma.image.findFirst({
		orderBy: {
			createdAt: 'desc',
		},
	});

	return latestImage;
}

/**
 * Récupère toutes les images générées
 */
export async function getAllImages() {
	const allImages = await prisma.image.findMany({
		orderBy: {
			createdAt: 'desc',
		},
	});

	return allImages;
}
