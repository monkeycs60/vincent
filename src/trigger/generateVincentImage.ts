import { schedules, logger } from '@trigger.dev/sdk/v3';

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
			// URL absolue codée en dur
			const apiUrl = 'https://vincent-xi.vercel.app/api/cron';
			logger.info(`Tentative d'appel à l'API: ${apiUrl}`);

			// Configurer un timeout explicite pour fetch
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout

			logger.info(`Exécution de fetch vers: ${apiUrl}`);
			const response = await fetch(apiUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(
					`Erreur API: ${response.status} ${response.statusText}`
				);
			}

			logger.info(`Réponse API reçue avec succès: ${response.status}`);
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
