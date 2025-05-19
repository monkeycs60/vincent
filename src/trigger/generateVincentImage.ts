import { schedules, logger } from '@trigger.dev/sdk/v3';
import { setTimeout as sleep } from 'timers/promises';

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
			// Déterminer l'URL de base
			const baseUrl = process.env.VERCEL_URL || 'localhost:3000';
			logger.info(`VERCEL_URL original: "${process.env.VERCEL_URL}"`);

			// Construire l'URL finale
			let apiUrl;
			if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
				// Utiliser l'URL complète telle quelle, en ajoutant juste le chemin
				apiUrl = `${baseUrl}/api/cron`;
				logger.info(
					`URL complète détectée - Utilisation directe: ${apiUrl}`
				);
			} else {
				// Ajouter le préfixe approprié
				apiUrl =
					baseUrl === 'localhost:3000'
						? `http://${baseUrl}/api/cron`
						: `https://${baseUrl}/api/cron`;
				logger.info(`Préfixe ajouté à l'URL: ${apiUrl}`);
			}

			logger.info(`Tentative d'appel à l'API: ${apiUrl}`);

			// Essayer avec une URL test externe d'abord pour voir si fetch fonctionne
			try {
				logger.info('Test de connectivité avec httpbin.org...');
				const testResponse = await fetch('https://httpbin.org/get', {
					method: 'GET',
				});
				logger.info(`Test de connectivité réussi: ${testResponse.status}`);
			} catch (testError) {
				logger.error('Échec du test de connectivité:', {
					error:
						testError instanceof Error
							? testError.message
							: String(testError),
				});
				// Continue quand même avec l'appel principal
			}

			// Ajouter un délai avant l'appel principal
			logger.info("Attente de 1 seconde avant l'appel principal...");
			await sleep(1000);

			// Configurer un timeout explicite pour fetch
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 secondes timeout

			logger.info(`Exécution de fetch vers: ${apiUrl}`);
			const response = await fetch(apiUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				signal: controller.signal,
			}).catch((error) => {
				logger.error(`Erreur de fetch initiale: ${error.message}`, {
					errorMessage:
						error instanceof Error ? error.message : String(error),
				});

				// Tentative alternative avec une autre URL
				if (process.env.VERCEL_URL) {
					const altUrl = `https://vincent-xi.vercel.app/api/cron`;
					logger.info(
						`Tentative alternative avec URL codée en dur: ${altUrl}`
					);
					return fetch(altUrl, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
					});
				}
				throw error;
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
