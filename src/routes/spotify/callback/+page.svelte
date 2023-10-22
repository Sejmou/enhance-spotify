<script lang="ts">
	import { browser } from '$app/environment';
	import type { SpotifyAPICredentials } from '$lib/spotify';
	import { storeCredentials } from '$lib/spotify';
	export let data: SpotifyAPICredentials;
	// TODO: there MUST be a smarter way to do this

	if (browser) {
		window.location.href = '/';
		storeCredentials(data);
	}
</script>
