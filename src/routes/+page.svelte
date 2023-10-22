<script lang="ts">
	import { onMount } from 'svelte';
	import { login, logout, spotifyCredentials, getTopArtists } from '$lib/spotify';
</script>

<h1>Enhance Spotify</h1>
<p>
	Fancy UI stuff will follow soon. For now, I am just trying to figure out how to get auth working.
</p>
{#if $spotifyCredentials}
	<button on:click={logout}>Logout</button>
{:else}
	<button on:click={login}>Login</button>
{/if}

{#if $spotifyCredentials}
	{#await getTopArtists() then data}
		{#each data.items as item}
			<div>
				<p>{item.name}</p>
				<img src={item.images[0].url} alt={item.name} />
			</div>
		{/each}
	{:catch error}
		<p>Something went wrong: {error.message}</p>
	{/await}
{/if}
