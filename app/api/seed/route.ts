import { NextResponse } from 'next/server';
import { seedInitialImages } from '@/lib/seed-initial-images';

// Cette route est protégée par une clé API simple
// En production, utilisez un système d'authentification plus robuste
const API_KEY = process.env.SEED_API_KEY || 'vincent-seed-key';

export async function GET(request: Request) {
	// Vérifier la clé API dans l'en-tête
	const apiKey = request.headers.get('x-api-key');

	if (!apiKey || apiKey !== API_KEY) {
		return NextResponse.json(
			{ success: false, message: 'Clé API non valide' },
			{ status: 401 }
		);
	}

	try {
		// Exécuter le script de seeding
		await seedInitialImages();

		return NextResponse.json({
			success: true,
			message: 'Génération des images initiales réussie',
		});
	} catch (error) {
		console.error('Erreur lors du seeding:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erreur lors de la génération des images initiales',
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}

// Cette route ne doit pas être mise en cache
export const dynamic = 'force-dynamic';
