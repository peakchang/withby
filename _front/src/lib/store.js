import { writable } from 'svelte/store'

export let admin_sidebar = writable(false);
export let admin_sidebar_width = writable(false);

export let user_info = writable('gogooooo');