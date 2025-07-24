<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { user, authToken, logout, type UserProfile } from '../stores/auth';
	import AvatarUploader from './AvatarUploader.svelte';
	import { get } from 'svelte/store';

	let open = false;
	let menuRef: HTMLDivElement;
	let currentUser: UserProfile | null = get(user);
	let token = get(authToken);

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
</script>

<div class="user-menu" bind:this={menuRef}>
	<button class="menu-btn" on:click={toggle} aria-haspopup="true" aria-expanded={open}>
		{#if currentUser?.avatar}
			<img class="avatar-mini" src={currentUser.avatar} alt="avatar" />
		{/if}
		Привет, {currentUser?.username || '...'}
	</button>
	{#if open}
		<div class="dropdown">
			<div style="text-align:center; margin-bottom:0.5em;">
				<AvatarUploader avatarUrl={currentUser?.avatar} token={token ?? undefined} />
			</div>
			<hr />
			<button
				on:click={() => (window.location.href = '/profile')}
				style="width:100%; margin-bottom:0.5em;">Профиль</button
			>
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
		display: flex;
		align-items: center;
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
