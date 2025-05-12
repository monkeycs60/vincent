import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import path from 'path';
import prisma from './prisma';

// Liste de punchlines pour les images initiales
const INITIAL_PUNCHLINES = [
	"Le JavaScript? C'est comme la démocratie, c'est le pire des langages à l'exception de tous les autres!",
	"J'ai connu l'époque où on codait en Pascal. Vous savez, le bon vieux temps où les bugs étaient des vrais bugs!",
	"Quand je vois le code que vous écrivez, je me dis que finalement la retraite, c'est pas si mal!",
	"Un bon développeur C++ est comme un bon vin, il s'améliore avec l'âge. Un développeur JS est plutôt comme un yaourt...",
	"J'ai encore dû lancer un SCUD sur les spécifications. Si ça continue, on va finir par manquer de munitions!",
];

// Liste des titres créatifs pour les images
const INITIAL_TITLES = [
	"Vincent dans l'univers de Matrix débugge le code de la réalité",
	"Vincent aux Jeux Olympiques du code remporte la médaille d'or en C++",
	"Vincent à la cour du roi JavaScript refuse de s'incliner",
	"Vincent dans l'espace apprend aux aliens les vrais langages de programmation",
	'Vincent dans un western code plus vite que son ombre',
];

// Liste des chemins d'images
const IMAGE_PATHS = [
	'public/vincent/IMG20250512173618.jpg',
	'public/vincent/IMG20250512173622.jpg',
	'public/vincent/IMG20250512173624.jpg',
	'public/vincent/IMG20250512173627.jpg',
	'public/vincent/IMG20250512173634_01.jpg',
];

/**
 * Fonction pour générer les images initiales à partir des photos réelles
 */
export async function seedInitialImages() {
	console.log('Début de la génération des images initiales...');

	try {
		// Vérifier si des images existent déjà
		const existingCount = await prisma.image.count();
		if (existingCount > 0) {
			console.log(
				'Des images existent déjà dans la base de données, génération ignorée.'
			);
			return;
		}

		// Créer une entrée pour chaque image
		for (let i = 0; i < IMAGE_PATHS.length; i++) {
			const imagePath = IMAGE_PATHS[i];
			const punchline = INITIAL_PUNCHLINES[i % INITIAL_PUNCHLINES.length];
			const title = INITIAL_TITLES[i % INITIAL_TITLES.length];
			const prompt = `Photo de Vincent en situation professionnelle, développeur senior`;

			// Lire le fichier image
			const fullPath = path.join(process.cwd(), imagePath);
			const imageBuffer = await readFile(fullPath);

			// Créer un nom pour l'image basé sur le nom du fichier original
			const fileName = path.basename(imagePath);

			// Uploader vers Vercel Blob
			const blob = await put(`vincent-initial-${fileName}`, imageBuffer, {
				access: 'public',
			});

			// Enregistrer les métadonnées dans la base de données
			await prisma.image.create({
				data: {
					url: blob.url,
					prompt,
					punchline,
					title,
					// Ajouter un décalage de date pour simuler des images générées sur plusieurs jours
					createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
					updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
				},
			});

			console.log(
				`Image ${i + 1}/${
					IMAGE_PATHS.length
				} téléchargée et enregistrée avec succès.`
			);
		}

		console.log('Génération des images initiales terminée avec succès!');
	} catch (error) {
		console.error(
			'Erreur lors de la génération des images initiales:',
			error
		);
		throw error;
	}
}
