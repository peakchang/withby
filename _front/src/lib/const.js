import { writable } from 'svelte/store';

export const back_api = `${import.meta.env.VITE_SERVER_URL}/api/v3`

export const back_api_origin = `${import.meta.env.VITE_SERVER_URL}`

export const user_info = writable({ id: '', name: '' })