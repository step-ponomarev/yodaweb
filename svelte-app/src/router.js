import {writable} from 'svelte/store';


import Login from './Login.svelte';
import Registration from './Registration.svelte';

export const router = {
    '/login': Login,
    '/registration': Registration,
};

export const currentRoute = writable('/');