import { NextResponse } from 'next/server';
import { generateVincentImage } from '@/lib/images';

export async function POST() {
	// Protection : accessible uniquement en développement
	if (process.env.NODE_ENV === 'production') {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	try {
		console.log('Début de la génération d\'image de test...');
		
		const result = await generateVincentImage();
		
		console.log('Image générée avec succès:', result.id);
		
		return NextResponse.json({
			success: true,
			data: {
				id: result.id,
				url: result.url,
				title: result.title,
				graphicalStyle: result.graphicalStyle,
				createdAt: result.createdAt,
			},
		});
	} catch (error) {
		console.error('Erreur lors de la génération d\'image de test:', error);
		
		return NextResponse.json({
			success: false,
			error: error instanceof Error ? error.message : 'Erreur inconnue',
		}, { status: 500 });
	}
}