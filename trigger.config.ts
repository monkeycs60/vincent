import { defineConfig } from '@trigger.dev/sdk/v3';
import { prismaExtension } from '@trigger.dev/build/extensions/prisma';

export default defineConfig({
	project: 'proj_ubgqafqiobtbfffcdwuq',
	runtime: 'node',
	logLevel: 'log',
	// The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
	// You can override this on an individual task.
	// See https://trigger.dev/docs/runs/max-duration
	maxDuration: 3600,
	retries: {
		enabledInDev: true,
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1000,
			maxTimeoutInMs: 10000,
			factor: 2,
			randomize: true,
		},
	},
	dirs: ['./src/trigger'],
	build: {
		// This is required to use the Sharp library
		external: ['sharp'],
		extensions: [
			prismaExtension({
				// update this to the path of your Prisma schema file
				schema: 'prisma/schema.prisma',
			}),
		],
	},
});
