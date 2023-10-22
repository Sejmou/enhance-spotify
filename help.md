In SvelteKit, you can use sessions to store data like an access token. You can set the session data in your server route and then access it on the client side.

First, you need to add a `handle` function to your `$layout.svelte` file or `src/hooks.js` (or `src/hooks.ts` if you're using TypeScript) to handle session data:

```javascript
// src/hooks.js
export async function handle({ request, resolve }) {
  const cookies = cookie.parse(request.headers.cookie || '');
  const accessToken = cookies.accessToken;

  const response = await resolve({
    ...request,
    locals: {
      accessToken: accessToken
    }
  });

  return response;
}

export function getSession({ locals }) {
  return {
    accessToken: locals.accessToken
  };
}
```

Then, in your server route, you can set the access token in a cookie:

```javascript
// routes/spotify/callback/+server.ts
export const GET: RequestHandler = async (request) => {
  // ... your existing code ...

  const accessToken = await response.json();

  return {
    headers: {
      'Set-Cookie': `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=Lax`
    },
    body: ''
  };
};
```

Now, you can access the access token on the client side:

```javascript
// any Svelte component
<script context="module">
  export async function load({ session }) {
    const accessToken = session.accessToken;
    // Now you can use the access token
  }
</script>
```

Finally, for redirection, you can use the `goto` function from `$app/navigation`:

```javascript
import { goto } from '$app/navigation';

// Redirect to a regular page
goto('/regular-page');
```

You might want to call this function after you've successfully obtained and stored the access token.