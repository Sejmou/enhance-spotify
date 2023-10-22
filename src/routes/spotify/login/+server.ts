import { redirect, type RequestHandler } from '@sveltejs/kit';
import querystring from 'querystring';
import env from '$lib/env';
import { stateKey } from '$lib/server';

// scopes ('granularity' of user-level data) required for Spotify API features used by this app https://developer.spotify.com/documentation/web-api/concepts/scopes
const scopes = ['user-top-read', 'user-follow-read'];
const scope = scopes.join(' ');

export const GET: RequestHandler = async (request) => {
	const authUrl = 'https://accounts.spotify.com/authorize?';
	const state = generateRandomString(16);
	const queryStr = querystring.stringify({
		response_type: 'code',
		client_id: env.SPOTIFY_CLIENT_ID,
		scope,
		redirect_uri: env.SPOTIFY_REDIRECT_URI,
		state
	});

	request.cookies.set(stateKey, state);
	throw redirect(302, authUrl + queryStr);
};

function generateRandomString(length: number) {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}
