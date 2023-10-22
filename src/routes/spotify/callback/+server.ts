import type { RequestHandler } from '@sveltejs/kit';
import { stateKey } from '$lib/server';
import env from '$lib/env';
import { SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import { json } from '@sveltejs/kit';

// as defined in https://developer.spotify.com/documentation/web-api/tutorials/code-flow#request-access-token
// needs to be sent in x-www-form-urlencoded format
type AccessTokenRequestParams = {
	code: string;
	redirect_uri: string;
	grant_type: 'authorization_code';
};

export const GET: RequestHandler = async (request) => {
	const state = request.url.searchParams.get('state');
	const code = request.url.searchParams.get('code');
	const storedState = request.cookies.get(stateKey);
	// console.log({ state, storedState });
	if (!state || state !== storedState) {
		return new Response('state_mismatch', { status: 400 });
	}
	if (!code) {
		return new Response('no_code', { status: 400 });
	}

	request.cookies.delete(stateKey);
	const data: AccessTokenRequestParams = {
		code,
		redirect_uri: env.SPOTIFY_REDIRECT_URI,
		grant_type: 'authorization_code'
	};
	// convert to x-www-form-urlencoded format
	const body = (Object.keys(data) as Array<keyof AccessTokenRequestParams>)
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
