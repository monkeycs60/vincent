import { schedules, logger } from '@trigger.dev/sdk/v3';
import { generateVincentImage } from '@/lib/images';

export const generateVincentImageTask = schedules.task({
	id: 'generate-vincent-image-daily',
	// Exécution tous les jours à 00:15 heure française (France est UTC+1/+2 selon l'heure d'été)
	cron: {
		pattern: '15 0 * * *',
		timezone: 'Europe/Paris',
	},
	run: async () => {
		logger.info(
			"Démarrage de la tâche de génération d'image quotidienne de Vincent..."
		);

		try {
			// Appel direct à la fonction generateVincentImage au lieu de passer par l'API
			logger.info('Appel direct à la fonction generateVincentImage');

			const newImage = await generateVincentImage();

			logger.info('Image de Vincent générée avec succès via appel direct', {
				imageData: newImage
					? {
							id: newImage.id,
							url: newImage.url,
							title: newImage.title,
					  }
					: null,
			});

			return {
				success: true,
				message: 'Image de Vincent générée avec succès',
				imageData: newImage,
			};
		} catch (error) {
			// Capture et journalisation de l'erreur
			logger.error("Erreur lors de la génération d'image de Vincent", {
				errorDetails:
					error instanceof Error
						? {
								name: error.name,
								message: error.message,
								stack: error.stack,
						  }
						: String(error),
			});

			// Retourne l'erreur pour la journalisation par Trigger.dev
			throw error;
		}
	},
});
