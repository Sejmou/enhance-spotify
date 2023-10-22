import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const env = createEnv({
	server: {
		SPOTIFY_CLIENT_ID: z.string().min(1),
		SPOTIFY_CLIENT_SECRET: z.string().min(1),
		SPOTIFY_REDIRECT_URI: z.string().min(1)
	},
	runtimeEnv: process.env
});

export default env;
