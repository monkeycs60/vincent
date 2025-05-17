import { put } from '@vercel/blob';
import prisma from './prisma';
import { experimental_generateImage as generateImage, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

const openai = createOpenAI({
	apiKey: process.env.OPEN_AI_API_KEY,
})

/**
 * Génère un titre créatif pour l'image
 */
async function generateCreativeTitle() {
	console.log('Génération du titre créatif...');
	const startTime = Date.now();

	try {
		const { text } = await generateText({
			model: google('gemini-2.0-flash'),
			prompt:
				"Génère un titre créatif pour une image humoristique mettant en scène Vincent dans une situation comique et dans un univers riche (bande dessinée, dessin animé, exoplanète, manga etc.). Format: 'Vincent dans [contexte insolite] [situation comique]'. Exemple: 'Vincent dans l'univers [x] débat avec [y] sur la supériorité du C++'",
			temperature: 0.8,
		});

		const duration = Date.now() - startTime;
		console.log(`Titre généré en ${duration}ms: "${text.trim()}"`);
		return text.trim();
	} catch (error) {
		console.error('Erreur lors de la génération du titre:', error);
		throw error;
	}
}

/**
 * Analyse les styles des images précédentes pour éviter les répétitions
 */
async function analyzeExistingStyles() {
	console.log("Analyse des styles d'images précédents...");
	const startTime = Date.now();

	try {
		const existingImages = await prisma.image.findMany({
			orderBy: { createdAt: 'desc' },
			take: 10,
			select: { prompt: true },
		});

		console.log(
			`${existingImages.length} images précédentes trouvées pour analyse`
		);

		if (existingImages.length === 0) {
			console.log('Aucune image précédente trouvée, analyse ignorée');
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

		const duration = Date.now() - startTime;
		console.log(`Analyse des styles terminée en ${duration}ms`);
		return text.trim();
	} catch (error) {
		console.error("Erreur lors de l'analyse des styles:", error);
		throw error;
	}
}

/**
 * Génère une nouvelle image avec l'IA et l'enregistre dans Vercel Blob
 */
export async function generateVincentImage() {
	console.log("Début du processus de génération d'image...");
	const totalStartTime = Date.now();

	try {
		// Générer un titre créatif
		const title = await generateCreativeTitle();

		// Analyser les styles existants et en proposer de nouveaux
		const styleAnalysis = await analyzeExistingStyles();

		// Générer un prompt complet pour l'image
		console.log('Génération du prompt détaillé...');
		const promptStartTime = Date.now();

		const { text: fullPrompt } = await generateText({
			model: google('gemini-2.0-flash'),
			prompt: `Crée un prompt détaillé pour générer une image humoristique et professionnelle basée sur ce titre: "${title}". 
			Voici l'analyse des styles précédents: "${styleAnalysis}".
			Le prompt doit décrire précisément Vincent (un développeur senior avec lunettes, dans la cinquantaine, vêtu de noir) dans une situation qui correspond au titre, avec un style artistique original qui n'est pas dans la liste des styles à éviter.
			Ne mentionne pas le titre directement dans le prompt, transforme-le en description visuelle.`,
		});

		console.log(`Prompt généré en ${Date.now() - promptStartTime}ms`);
		console.log(`Prompt: "${fullPrompt.substring(0, 100)}..."`);

		// Générer une punchline sarcastique pour accompagner l'image
		console.log('Génération de la punchline...');
		const punchlineStartTime = Date.now();

		const { text: punchline } = await generateText({
			model: google('gemini-2.0-flash'),
			prompt: `Crée une punchline sarcastique courte (max 100 caractères) que Vincent pourrait dire, en lien avec ce titre: "${title}". La punchline doit être cynique, technique et faire référence au monde du développement.`,
			temperature: 0.7,
		});

		console.log(
			`Punchline générée en ${
				Date.now() - punchlineStartTime
			}ms: "${punchline}"`
		);

		// Générer l'image avec le prompt élaboré
		console.log("Génération de l'image avec OpenAI...");
		const imageStartTime = Date.now();

		const { image } = await generateImage({
			model: openai.image('gpt-image-1'),
			prompt: fullPrompt,
			aspectRatio: '16:9',
		});

		console.log(`Image générée en ${Date.now() - imageStartTime}ms`);

		// Enregistrement dans Vercel Blob
		console.log(
			"Conversion de l'image en Buffer et enregistrement dans Vercel Blob..."
		);
		const blobStartTime = Date.now();

		const buffer = Buffer.from(image.uint8Array);
		const blob = await put(`vincent-${Date.now()}.png`, buffer, {
			access: 'public',
		});

		console.log(
			`Image enregistrée dans Vercel Blob en ${Date.now() - blobStartTime}ms`
		);
		console.log(`URL de l'image: ${blob.url}`);

		// Enregistrement des métadonnées dans la base de données
		console.log('Enregistrement des métadonnées dans la base de données...');
		const dbStartTime = Date.now();

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

		console.log(
			`Métadonnées enregistrées en ${
				Date.now() - dbStartTime
			}ms. ID de l'image: ${newImage.id}`
		);
		console.log(
			`Processus de génération terminé en ${Date.now() - totalStartTime}ms`
		);

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
	console.log('Récupération de la dernière image...');
	const startTime = Date.now();

	try {
		const latestImage = await prisma.image.findFirst({
			orderBy: {
				createdAt: 'desc',
			},
		});

		console.log(
			`Dernière image récupérée en ${Date.now() - startTime}ms. ${
				latestImage ? `ID: ${latestImage.id}` : 'Aucune image trouvée'
			}`
		);
		return latestImage;
	} catch (error) {
		console.error(
			'Erreur lors de la récupération de la dernière image:',
			error
		);
		throw error;
	}
}

/**
 * Récupère toutes les images générées
 */
export async function getAllImages() {
	console.log('Récupération de toutes les images...');
	const startTime = Date.now();

	try {
		const allImages = await prisma.image.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		});

		console.log(
			`${allImages.length} images récupérées en ${Date.now() - startTime}ms`
		);
		return allImages;
	} catch (error) {
		console.error(
			'Erreur lors de la récupération de toutes les images:',
			error
		);
		throw error;
	}
}
