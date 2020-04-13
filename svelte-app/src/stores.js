import { writable } from 'svelte/store';

export const SESSIONID = writable('');
export const CSRF = writable('');
export const USER = writable(null);

export const AUTHORIZED = writable(false);
export const AUTH_IS_CHECKED = writable(false);

export const TASKS = writable(Array(0));

export const CURRENT_BOX = writable('');



