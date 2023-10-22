// various helpers for the Spotify API
// TODO: this is probably total BS from a security perspective and probably also not the smartest way to do it
import { derived } from 'svelte/store';
import { browser } from '$app/environment';
import { localStorageStore } from './local-storage-store';
import { z } from 'zod';

const credentials = localStorageStore<SpotifyCredentials | null>('spotifyCredentials', null);

// keep the credentials (access token!) fresh
credentials.subscribe((value) => {
	if (value === null) return;
	const now = Date.now();
	const { expiresAt } = value;
	const timeLeft = expiresAt - now;
	setTimeout(() => {
		refreshAccessToken(value);
	}, timeLeft - 1000);
});

async function refreshAccessToken(oldCredentials: SpotifyCredentials) {
	const response = await fetch(`/refresh_token?refresh_token=${oldCredentials.refreshToken}`);
	const newCredentials = await response.json();
	credentials.set(processRawCredentials(newCredentials));
}

export const loggedIn = derived(credentials, ($credentials) => {
	return $credentials !== null;
});

export function login() {
	if (browser) {
		window.location.href = '/spotify/login';
	}
}

export function logout() {
	credentials.set(null);
}

/**
 * Credentials we get from the Spotify API.
 */
export type SpotifyAPICredentials = {
	access_token: string;
	refresh_token: string;
	expires_in: number;
};

/**
 * Convenience type for the Spotify credentials (stored in the browser).
 */
export type SpotifyCredentials = {
	accessToken: string;
	refreshToken: string;
	expiresAt: number; // unix timestamp
};

function processRawCredentials(credentials: SpotifyAPICredentials): SpotifyCredentials {
	const now = Date.now();
	const expiresAt = now + credentials.expires_in * 1000;
	return {
		accessToken: credentials.access_token,
		refreshToken: credentials.refresh_token,
		expiresAt
	};
}

let currentCredentials: SpotifyCredentials | null = null;
credentials.subscribe((value) => {
	currentCredentials = value;
});

async function makeSpotifyRequest<T>(endpoint: string, validator: z.ZodType<T>) {
	if (currentCredentials === null) {
		throw new Error('No credentials available');
	}

	const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
		headers: {
			Authorization: `Bearer ${currentCredentials.accessToken}`
		}
	});

	if (response.status === 401) {
		refreshAccessToken(currentCredentials);
		return makeSpotifyRequest(endpoint, validator);
	}

	if (response.status !== 200) {
		throw new Error(`Spotify API request failed with status ${response.status}`);
	}

	try {
		const data = validator.parse(await response.json());
		return data;
	} catch (e) {
		if (e instanceof z.ZodError)
			throw new Error(`Spotify API response did not match expected schema: ${e.message}`);
		else throw e;
	}
}

export const spotifyCredentials = derived(credentials, ($credentials) => {
	if ($credentials === null) {
		return null;
	}
	return $credentials;
});

export function storeCredentials(apiCredentials: SpotifyAPICredentials) {
	credentials.set(processRawCredentials(apiCredentials));
}

const artistValidator = z.object({
	id: z.string(),
	name: z.string(),
	images: z.array(
		z.object({
			url: z.string()
		})
	)
});

const topArtistResponseValidator = z.object({
	items: z.array(artistValidator)
});

export async function getTopArtists() {
	const response = await makeSpotifyRequest('me/top/artists?limit=50', topArtistResponseValidator);
	return response;
}
