import { put } from '@vercel/blob';
import prisma from './prisma';
import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import OpenAI, { toFile } from 'openai';
import { Buffer } from 'buffer';

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
			select: { title: true },
		});

		const existingTitles = existingImages.map((img) => img.title);
		console.log(
			`${existingTitles.length} titres précédents récupérés pour analyse`
		);

		let prompt = '';

		if (existingTitles.length >= 10) {
			// Si on a suffisamment de titres existants, on les utilise comme référence
			prompt = `Voici les derniers titres générés pour des images humoristiques: "${existingTitles.join(
				'", "'
			)}"
			
			Génère un NOUVEAU titre original d'une dizaine de mots du genre "Vincent dans [univers différent] en train de [faire une action liée au développement]".
			Le titre doit être complètement différent des précédents et placer Vincent dans un univers qui n'a pas encore été exploré.
			Vincent est un développeur senior sarcastique qui critique souvent les nouvelles technologies ou les mauvaises pratiques.`;
		} else {
			// Sinon, on donne des instructions plus générales
			prompt = `Génère un titre original d'une dizaine de mots du genre "Vincent dans [univers différent] en train de [faire une action liée au développement]".
			Vincent est un vieux dinosaure du développement qui se retrouve dans un univers différent en train de pester sur une problématique de dev.
			Le titre doit placer Vincent dans un contexte insolite (univers de fiction, lieu improbable, époque historique...) 
			où il fait des réflexions narquoises, énervées ou ironiques sur le monde du développement.`;
		}

		const { text } = await generateText({
			model: google('gemini-2.0-flash'),
			prompt,
			temperature: 0.8,
		});

		const title = text.trim();
		const duration = Date.now() - startTime;
		console.log(`Titre généré en ${duration}ms: "${title}"`);
		return title;
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
		const title = await generateCreativeTitle();

		// Préparer le prompt pour la génération d'image
		const prompt = `Crée une image humoristique illustrant ce titre: "${title}". 
		L'image doit montrer Vincent, un développeur senior cynique avec lunettes, dans la cinquantaine, vêtu de noir, 
		dans la situation décrite par le titre. Tu peux trouver une image de référence en pièce-jointe et tu dois t'inspirer de ses traits. Tu dois à chaque fois utiliser un style graphique original.`;

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

		const rsp = await client.images.edit({
			model: 'gpt-image-1',
			image: vincentImageFile,
			prompt,
		});

		console.log(rsp);

		// const result = await generateObject({
		// 	model: openai('chatgpt-4o-latest'),
		// 	schema: VincentImageSchema,
		// 	messages: [
		// 		{
		// 			role: 'user',
		// 			content: [
		// 				{ type: 'text', text: prompt },
		// 				{
		// 					type: 'image',
		// 					image: 'https://cd12r53fudbdemeq.public.blob.vercel-storage.com/vincentbiere-SxVL1chxZY90HxsCmIeuVXqtcVIqwT.png',
		// 				},
		// 			],
		// 		},
		// 	],
		// });

		console.log(`Image générée en ${Date.now() - imageStartTime}ms`);

		// Enregistrement dans Vercel Blob
		console.log("Enregistrement de l'image dans Vercel Blob...");
		const blobStartTime = Date.now();

		console.log('LA DTA ARRIVE', rsp.data?.[0]);
		console.log('LA DTA ARRIVE', rsp.data?.[0].b64_json);

		// if (
		// 	!rsp.data ||
		// 	!rsp.data[0] ||
		// 	!rsp.data[0].url ||
		// 	!rsp.data[0].b64_json
		// ) {
		// 	throw new Error("Aucune image générée par l'API OpenAI");
		// }

		const buffer = Buffer.from(rsp.data?.[0]?.b64_json || '', 'base64');
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
