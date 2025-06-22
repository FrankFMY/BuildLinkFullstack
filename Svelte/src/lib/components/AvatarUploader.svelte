<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { api } from '../utils/api';
	const dispatch = createEventDispatcher();

	export let avatarUrl: string | null | undefined = '';
	export let token: string = '';
	let fileInput: HTMLInputElement;
	let preview: string = avatarUrl ?? '';
	let loading = false;
	let error = '';

	// Drag&drop
	function onDrop(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer?.files?.length) {
			handleFile(e.dataTransfer.files[0]);
		}
	}
	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

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
		try {
			const res = await api.post('/users/me/avatar', form, token);
			if (res.avatar) {
				preview = res.avatar;
				dispatch('change', { avatar: res.avatar });
			} else {
				error = res.error || res.message || 'Ошибка загрузки';
				console.error('Avatar upload error:', res);
			}
		} catch (e: any) {
			error = e?.data?.error || e?.data?.message || e?.message || 'Ошибка';
			console.error('Avatar upload exception:', e);
		} finally {
			loading = false;
		}
	}

	async function remove() {
		loading = true;
		error = '';
		try {
			const res = await api.delete('/users/me/avatar', token);
			if (res.message) {
				preview = '';
				dispatch('change', { avatar: '' });
			} else {
				error = res.error || res.message || 'Ошибка удаления';
				console.error('Avatar delete error:', res);
			}
		} catch (e: any) {
			error = e?.data?.error || e?.data?.message || e?.message || 'Ошибка';
			console.error('Avatar delete exception:', e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="avatar-uploader">
	{#if preview}
		<img class="preview" src={preview} alt="avatar preview" />
		<button on:click={remove} disabled={loading}>Удалить</button>
	{/if}
	<div
		class="dropzone"
		on:drop={onDrop}
		on:dragover={onDragOver}
		on:click={() => fileInput.click()}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') fileInput.click();
		}}
		role="button"
		tabindex="0"
	>
		{#if !preview}
			<span>Перетащите файл или выберите...</span>
		{/if}
		<input
			type="file"
			accept="image/*"
			bind:this={fileInput}
			style="display:none"
			on:change={handleInputChange}
		/>
	</div>
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
	.preview {
		width: 128px;
		height: 128px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid #ddd;
	}
	.dropzone {
		border: 2px dashed #aaa;
		padding: 1rem;
		border-radius: 8px;
		cursor: pointer;
		text-align: center;
	}
	.error {
		color: #e00;
		font-size: 0.9em;
	}
</style>
