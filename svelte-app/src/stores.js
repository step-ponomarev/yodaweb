import { writable } from 'svelte/store';

export const SESSIONID = writable('');
export const CSRF = writable('');
export const USER = writable(null);
export const AUTH_MODE = writable('LOGIN'); // LOGIN REGISTRATION AUTHORIZED

export const BOX_MODE = writable('TODAY'); // TODAY WEEK LATE INBOX


