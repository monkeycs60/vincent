import { NextResponse } from 'next/server';
import { generateVincentImage } from '@/lib/images';

export async function GET() {
	try {
		// Appel à la nouvelle fonction generateVincentImage sans paramètres
		// qui générera automatiquement le titre, le prompt élaboré et la punchline
		const newImage = await generateVincentImage();

		return NextResponse.json({
			success: true,
			message: 'Image de Vincent générée avec succès',
			data: newImage,
		});
	} catch (error) {
		console.error('Erreur dans le cron job:', error);
		return NextResponse.json(
			{
				success: false,
				message: "Erreur lors de la génération de l'image de Vincent",
			},
			{ status: 500 }
		);
	}
}

// Cette route ne devrait être appelée que par un cron job
export const dynamic = 'force-dynamic';
