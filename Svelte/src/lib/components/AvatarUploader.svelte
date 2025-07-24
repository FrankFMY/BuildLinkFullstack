<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { api } from '../utils/api';
	const dispatch = createEventDispatcher();

	export let avatarUrl: string | null | undefined = '';
	export let token: string = '';
	let fileInput: HTMLInputElement;
	let preview: string = avatarUrl ?? '';
	let loading = false;
	let error = '';
	let hover = false;

	// Обновляем preview при изменении avatarUrl
	$: preview = avatarUrl || '';

	// Drag&drop
	function handleFile(file: File) {
		error = '';
		if (!file.type.startsWith('image/')) {
			error = 'Только изображения';
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			error = 'Максимум 5 МБ';
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			preview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
		upload(file);
	}

	function handleInputChange(e: Event) {
		const target = e.target as HTMLInputElement | null;
		if (target && target.files && target.files[0]) {
			handleFile(target.files[0]);
		}
	}

	async function upload(file: File) {
		loading = true;
		error = '';
		const form = new FormData();
		form.append('avatar', file);
		console.log('Uploading avatar, token:', token);
		try {
			const res = await api.post('/api/users/me/avatar', form, token);
			console.log('Avatar upload response:', res);
			if (res.avatar) {
				const fullUrl = res.avatar;
				preview = fullUrl;
				dispatch('change', { avatar: res.avatar });
			} else {
				error = res.error || res.message || 'Ошибка загрузки';
				console.error('Avatar upload error:', res);
			}
		} catch (e: unknown) {
			const err = e as { data?: { error?: string; message?: string }; message?: string };
			error = err.data?.error || err.data?.message || err.message || 'Ошибка';
			console.error('Avatar upload exception:', e);
		} finally {
			loading = false;
		}
	}

	async function remove() {
		loading = true;
		error = '';
		try {
			const res = await api.delete('/api/users/me/avatar', token);
			if (res.message) {
				preview = '';
				dispatch('change', { avatar: '' });
			} else {
				error = res.error || res.message || 'Ошибка удаления';
				console.error('Avatar delete error:', res);
			}
		} catch (e: unknown) {
			const err = e as { data?: { error?: string; message?: string }; message?: string };
			error = err.data?.error || err.data?.message || err.message || 'Ошибка';
			console.error('Avatar delete exception:', e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="avatar-uploader">
	{#if preview}
		<div
			class="avatar-wrapper"
			role="button"
			tabindex="0"
			on:mouseenter={() => (hover = true)}
			on:mouseleave={() => (hover = false)}
			on:keydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					hover = !hover;
				}
			}}
		>
			<img class="preview" src={preview} alt="avatar preview" />
			{#if hover}
				<button
					class="overlay"
					on:click={() => fileInput.click()}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							fileInput.click();
						}
					}}
				>
					<span>Сменить фото</span>
				</button>
			{/if}
			<button class="delete-btn" on:click={remove} disabled={loading} title="Удалить фото">✕</button
			>
		</div>
	{:else}
		<button class="upload-btn" on:click={() => fileInput.click()} disabled={loading}>
			Загрузить фото
		</button>
	{/if}
	<input
		type="file"
		accept="image/*"
		bind:this={fileInput}
		style="display:none"
		on:change={handleInputChange}
	/>
	{#if error}
		<div class="error">{error}</div>
	{/if}
	{#if loading}
		<div>Загрузка...</div>
	{/if}
</div>

<style>
	.avatar-uploader {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
	.avatar-wrapper {
		position: relative;
		display: inline-block;
	}
	.preview {
		width: 128px;
		height: 128px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid #ddd;
		transition: filter 0.2s;
	}
	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		font-size: 1.1em;
		border-radius: 50%;
		cursor: pointer;
		transition: background 0.2s;
	}
	.avatar-wrapper:hover .preview {
		filter: brightness(0.6);
	}
	.upload-btn {
		width: 128px;
		height: 128px;
		border-radius: 50%;
		border: 2px dashed #aaa;
		background: #23223a;
		color: #fff;
		font-size: 1em;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.upload-btn:hover {
		background: #181828;
		color: #e0e0e0;
	}
	.delete-btn {
		position: absolute;
		top: 6px;
		right: 6px;
		background: rgba(0, 0, 0, 0.6);
		color: #fff;
		border: none;
		border-radius: 50%;
		width: 28px;
		height: 28px;
		font-size: 1.1em;
		cursor: pointer;
		z-index: 2;
		transition: background 0.2s;
		opacity: 0.8;
	}
	.delete-btn:hover {
		background: #e00;
		opacity: 1;
	}
	.error {
		color: #e00;
		font-size: 0.9em;
	}
</style>
