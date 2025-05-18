import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		domains: ['cd12r53fudbdemeq.public.blob.vercel-storage.com'],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
