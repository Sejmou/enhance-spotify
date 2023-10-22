<script lang="ts">
	import { login } from '$lib/spotify';
</script>

<h1>Enhance Spotify</h1>
<p>
	Fancy UI stuff will follow soon. For now, I am just trying to figure out how to get auth working.
</p>
<button on:click={login}>Login</button>
