import { NextRequest, NextResponse } from 'next/server';
import { generateVincentImage } from '@/lib/images';

// Map simple pour stocker les dernières générations par IP (non persistant entre les redémarrages)
// Dans un environnement de production, utilisez un stockage persistant
const lastGenerationMap = new Map<string, number>();

// Limiter les requêtes à 1 par minute par utilisateur
export async function POST(request: NextRequest) {
	console.log('Démarrage de la requête POST /api/generate');

	try {
		// Obtenir l'adresse IP pour le log
		const ip = request.ip || '127.0.0.1';
		console.log(`Requête reçue de l'IP: ${ip}`);

		// Vérifier quand était la dernière génération (juste pour le log)
		const lastGeneration = lastGenerationMap.get(ip);
		const now = Date.now();

		if (lastGeneration) {
			const elapsedSeconds = Math.floor((now - lastGeneration) / 1000);
			console.log(`Dernière génération il y a ${elapsedSeconds} secondes`);
		} else {
			console.log(`Première génération pour cette IP`);
		}

		// Génération de l'image (sans vérification de rate limit)
		console.log("Début de la génération d'image");
		const newImage = await generateVincentImage();
		console.log(
			`Image générée avec succès. ID: ${newImage.id}, Titre: ${newImage.title}`
		);

		// Enregistrer l'heure de dernière génération
		lastGenerationMap.set(ip, now);
		console.log(`Génération enregistrée à ${new Date(now).toISOString()}`);

		return NextResponse.json({
			success: true,
			message: 'Image de Vincent générée avec succès',
			data: newImage,
		});
	} catch (error) {
		console.error("Erreur dans l'API de génération:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Erreur lors de la génération de l'image de Vincent",
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}

// Cette route ne doit pas être mise en cache
export const dynamic = 'force-dynamic';
