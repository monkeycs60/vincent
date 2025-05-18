import { schedules, logger } from '@trigger.dev/sdk/v3';

export const generateVincentImageTask = schedules.task({
	id: 'generate-vincent-image-daily',
	// Exécution tous les jours à 00:15 heure française (France est UTC+1/+2 selon l'heure d'été)
	cron: {
		pattern: '15 0 * * *',
		timezone: 'Europe/Paris',
	},
	run: async (payload) => {
		logger.info(
			"Démarrage de la tâche de génération d'image quotidienne de Vincent..."
		);

		try {
			// Appel à l'API existante qui utilise generateVincentImage
			const apiUrl = process.env.VERCEL_URL
				? `https://${process.env.VERCEL_URL}/api/cron`
				: 'http://localhost:3000/api/cron';

			const response = await fetch(apiUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error(
					`Erreur API: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();

			logger.info("Image de Vincent générée avec succès via l'API", {
				success: data.success,
				message: data.message,
				imageData: data.data
					? {
							id: data.data.id,
							url: data.data.url,
							title: data.data.title,
					  }
					: null,
			});

			return {
				success: data.success,
				message: data.message,
				imageData: data.data,
			};
		} catch (error) {
			// Capture et journalisation de l'erreur
			logger.error("Erreur lors de l'appel à l'API de génération d'image", {
				error,
			});

			// Retourne l'erreur pour la journalisation par Trigger.dev
			throw error;
		}
	},
});
