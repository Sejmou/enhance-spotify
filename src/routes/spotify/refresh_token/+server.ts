import type { RequestHandler } from '@sveltejs/kit';
import env from '$lib/env';
import { SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import { json } from '@sveltejs/kit';

// as defined in https://developer.spotify.com/documentation/web-api/tutorials/code-flow#request-a-refreshed-access-token
// needs to be sent in x-www-form-urlencoded format
type RefreshTokenRequestParams = {
	refresh_token: string;
	redirect_uri: string;
	grant_type: 'refresh_token';
};

export const GET: RequestHandler = async (request) => {
	const refreshToken = request.url.searchParams.get('refresh_token');

	if (!refreshToken) {
		return new Response('no_refresh_token', { status: 400 });
	}

	const data: RefreshTokenRequestParams = {
		refresh_token: refreshToken,
		redirect_uri: env.SPOTIFY_REDIRECT_URI,
		grant_type: 'refresh_token'
	};
	// convert to x-www-form-urlencoded format
	const body = (Object.keys(data) as Array<keyof RefreshTokenRequestParams>)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
		.join('&');

	const headers = {
		Authorization:
			'Basic ' +
			Buffer.from(env.SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
		'Content-Type': 'application/x-www-form-urlencoded'
	};

	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		body,
		headers
	});

	const accessToken = await response.json();
	// console.log(accessToken);

	return json(accessToken);
};
