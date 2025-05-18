import { put } from '@vercel/blob';
import prisma from './prisma';
import { generateObject } from 'ai';
import {
	createGoogleGenerativeAI,
	GoogleGenerativeAIProviderOptions,
} from '@ai-sdk/google';
import { z } from 'zod';
import OpenAI, { toFile } from 'openai';
import { Buffer } from 'buffer';
import sharp from 'sharp';

const google = createGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

const client = new OpenAI({
	apiKey: process.env.OPEN_AI_API_KEY,
});

/**
 * Génère un titre créatif pour l'image en se basant sur les titres précédents
 */
async function generateCreativeTitle() {
	console.log('Génération du titre créatif...');
	const startTime = Date.now();

	try {
		// Récupérer les 50 derniers titres pour analyser les tendances
		const existingImages = await prisma.image.findMany({
			orderBy: { createdAt: 'desc' },
			take: 50,
			select: { title: true, graphicalStyle: true },
		});

		const existingTitles = existingImages.map((img) => img.title);
		console.log(
			`${existingTitles.length} titres précédents récupérés pour analyse`
		);
		const existingGraphicStyles = existingImages.map(
			(img) => img.graphicalStyle
		);
		console.log(
			`${existingGraphicStyles.length} styles graphiques précédents récupérés pour analyse`
		);

		let prompt = '';

		if (existingTitles.length >= 1) {
			prompt = `Voici les derniers titres générés pour des images humoristiques: "${existingTitles.join(
				'", "'
			)} et voici les styles graphiques utilisés précédemment: ${existingGraphicStyles.join(
				'", "'
			)}"`;

			prompt += `Génère un seul titre original d'une dizaine de mots à propos de Vincent. Du genre "Vincent dans [univers différent] en train de [faire une action liée au développement]".
			Le titre doit être complètement différent des précédents et placer Vincent dans un univers qui n'a pas encore été exploré.
			Vincent est un développeur senior qui a tout connu et il est sarcastique et critique souvent les nouvelles technologies ou les mauvaises pratiques, les frameworks à la mode. Ne génère qu'un seul titre.
			Aussi, tu dois générer un style graphique unique et originale (bande dessinée belge années 50, manga, univers pirate, caricature journal, ce que tu veux), n'enfreignant pas de copyright et ne citant pas de nom d'artistes (utilise plutôt des périphrases) et différent des précédents styles graphiques à chaque fois.`;
		} else {
			prompt = `Génère un seul titre original d'une dizaine de mots à propos de Vincent. Du genre "Vincent dans [univers différent] en train de [faire une action liée au développement]".
			Vincent est un développeur senior qui a tout connu et il est sarcastique et critique souvent les nouvelles technologies ou les mauvaises pratiques, les frameworks à la mode. Ne génère qu'un seul titre.
			Le titre doit placer Vincent dans un contexte insolite (univers de fiction, lieu improbable, époque historique...) 
			où il fait un réflexion narquoise, énervée ou ironique sur le monde du développement. Tu dois aussi générer un style graphique unique et originale (bande dessinée belge années 50, manga, univers pirate, caricature journal, ce que tu veux), n'enfreignant pas de copyright et ne citant pas de nom d'artistes (utilise plutôt des périphrases) et différent des précédents styles graphiques à chaque fois.`;
		}

		console.log('prmpt premier du graphic style', prompt);

		const result = await generateObject({
			providerOptions: {
				google: {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					thinkingConfig: {
						thinkingBudget: 0,
					},
				} satisfies GoogleGenerativeAIProviderOptions,
			},
			model: google('gemini-2.5-flash-preview-04-17'),
			prompt,
			schema: z.object({
				title: z.string(),
				graphicalStyle: z.string(),
			}),
		});

		const title = result.object.title.trim();
		const graphicalStyle = result.object.graphicalStyle.trim();
		const duration = Date.now() - startTime;
		console.log(`Titre généré en ${duration}ms: "${title}"`);
		console.log('graphicalStyle généré', graphicalStyle);
		return { title, graphicalStyle };
	} catch (error) {
		console.error('Erreur lors de la génération du titre:', error);
		throw error;
	}
}

/**
 * Génère une nouvelle image avec l'IA en utilisant l'image de référence de Vincent
 */
export async function generateVincentImage() {
	console.log("Début du processus de génération d'image...");
	const totalStartTime = Date.now();

	try {
		// Générer un titre créatif
		const { title, graphicalStyle } = await generateCreativeTitle();

		// Préparer le prompt pour la génération d'image
		const prompt = `Crée une image humoristique illustrant ce titre: "${title}". 
		L'image doit montrer Vincent, un développeur senior cynique avec lunettes, dans la cinquantaine, vêtu de noir, 
		dans la situation décrite par le titre et respectant le style graphique suivant: ${graphicalStyle} (en évitant les infractions de copyr). Tu peux trouver une image de référence en pièce-jointe et tu dois t'inspirer de ses traits.`;

		// Générer l'image avec le prompt et l'image de référence
		console.log("Génération de l'image avec OpenAI...");
		const imageStartTime = Date.now();

		// Télécharger l'image de référence depuis l'URL
		const imageUrl =
			'https://cd12r53fudbdemeq.public.blob.vercel-storage.com/vincentbiere-SxVL1chxZY90HxsCmIeuVXqtcVIqwT.png';
		console.log(
			`Téléchargement de l'image de référence depuis ${imageUrl}...`
		);
		const response = await fetch(imageUrl);

		if (!response.ok) {
			throw new Error(
				`Impossible de télécharger l'image: ${response.status} ${response.statusText}`
			);
		}

		const imageBuffer = await response.arrayBuffer();
		const vincentImageFile = await toFile(
			new Uint8Array(imageBuffer),
			'vincent-reference.png',
			{ type: 'image/png' }
		);

		console.log('PROMPT COMPLET', prompt);

		const rsp = await client.images.edit({
			model: 'gpt-image-1',
			image: vincentImageFile,
			prompt,
			size: '1024x1536',
		});

		console.log(`Image générée en ${Date.now() - imageStartTime}ms`);

		// Enregistrement dans Vercel Blob
		console.log(
			"Compression et enregistrement de l'image dans Vercel Blob..."
		);
		const blobStartTime = Date.now();

		// Convertir l'image base64 en buffer
		const originalBuffer = Buffer.from(
			rsp.data?.[0]?.b64_json || '',
			'base64'
		);

		// Compresser l'image avec Sharp
		console.log("Compression de l'image avec Sharp...");
		const compressStartTime = Date.now();

		const compressedBuffer = await sharp(originalBuffer)
			.resize(800, 800, { fit: 'inside', withoutEnlargement: true }) // Redimensionner si nécessaire
			.png({ quality: 80, compressionLevel: 9 }) // Compression PNG optimale
			.toBuffer();

		console.log(`Image compressée en ${Date.now() - compressStartTime}ms`);
		console.log(
			`Taille originale: ${originalBuffer.length} octets, Taille compressée: ${compressedBuffer.length} octets`
		);
		console.log(
			`Réduction: ${Math.round(
				(1 - compressedBuffer.length / originalBuffer.length) * 100
			)}%`
		);

		// Enregistrer l'image compressée dans Vercel Blob
		const blob = await put(`vincent-${Date.now()}.png`, compressedBuffer, {
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
				title,
				graphicalStyle,
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
