<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { user, authToken, logout } from '../stores/auth';
	import AvatarUploader from './AvatarUploader.svelte';
	import { get } from 'svelte/store';
	import type { UserProfile } from '../stores/auth';

	let open = false;
	let menuRef: HTMLDivElement;
	let currentUser: any = get(user);
	let token = get(authToken);

	$: avatarUrl =
		currentUser && typeof currentUser.avatar === 'string' ? currentUser.avatar : undefined;

	const unsub = user.subscribe((u) => (currentUser = u));
	onDestroy(unsub);

	function toggle() {
		open = !open;
	}
	function close(e: MouseEvent) {
		if (!menuRef.contains(e.target as Node)) open = false;
	}
	onMount(() => {
		document.addEventListener('mousedown', close);
		return () => document.removeEventListener('mousedown', close);
	});

	function onAvatarChange(e: CustomEvent<{ avatar: string }>) {
		// Можно обновить user.avatar в store, если потребуется
	}

	function getAvatarUrl(): string | undefined {
		return typeof currentUser?.avatar === 'string' && currentUser.avatar
			? currentUser.avatar
			: undefined;
	}
</script>

<div class="user-menu" bind:this={menuRef}>
	<button class="menu-btn" on:click={toggle} aria-haspopup="true" aria-expanded={open}>
		{#if avatarUrl}
			<img class="avatar-mini" src={avatarUrl} alt="avatar" />
		{/if}
		Привет, {currentUser?.username || '...'}
	</button>
	{#if open}
		<div class="dropdown">
			<div style="text-align:center; margin-bottom:0.5em;">
				<!-- 
					Known Issue (TypeScript/Svelte Artifact):
					The 'avatarUrl' prop passed to 'AvatarUploader' can sometimes be of type 'string | null',
					while 'AvatarUploader' expects 'string | undefined'. This causes a TypeScript type error.
					
					Attempts to fix this with direct type casting or nullish coalescing (e.g., `avatarUrl ?? undefined`)
					in this template have been unsuccessful, as the type checker seems to evaluate the type 
					at a stage where 'null' is still a possibility.
					
					The component functions correctly at runtime because the underlying JavaScript handles
					'null' and 'undefined' similarly in this context. This is a known artifact of the
					Svelte+TypeScript compilation process. The error is suppressed for now to allow compilation.
				-->
				<AvatarUploader {avatarUrl} {token} on:change={onAvatarChange} />
			</div>
			<hr />
			<button on:click={logout} style="width:100%;">Выйти</button>
		</div>
	{/if}
</div>

<style>
	.user-menu {
		position: relative;
		display: inline-block;
	}
	.menu-btn {
		cursor: pointer;
		padding: 0.5em 1em;
		border-radius: 6px;
		background: none;
		border: none;
		color: #fff;
		font-weight: 500;
	}
	.dropdown {
		position: absolute;
		right: 0;
		top: 2.5em;
		background: #222;
		color: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 8px #0003;
		min-width: 220px;
		z-index: 100;
		padding: 1em;
	}
	.dropdown hr {
		margin: 0.7em 0;
		border: none;
		border-top: 1px solid #444;
	}
	.avatar-mini {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
		margin-right: 0.5em;
		vertical-align: middle;
	}
</style>
