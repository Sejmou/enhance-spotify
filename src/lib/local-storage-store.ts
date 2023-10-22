import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export function localStorageStore<T>(key: string, initialValue: T) {
	if (!browser) {
		// this is not really usable on the server
		return writable<T>(initialValue);
	}
	const raw = localStorage.getItem(key);
	const value = raw ? JSON.parse(raw) : initialValue;
	const store = writable<T>(value);
	store.subscribe((value) => {
		if (value !== null) {
			localStorage.setItem(key, JSON.stringify(value));
		} else {
			localStorage.removeItem(key);
		}
	});
	return store;
}
