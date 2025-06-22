<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';

	interface Ad {
		id: string;
		title: string;
		description: string;
		price: number;
		author: string;
		created_at: string;
	}

	let ads: Ad[] = [];
	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			const rawAds = await api.get('/api/ads');
			ads = rawAds.map((ad: any) => ({
				id: ad._id || ad.id,
				title: ad.title,
				description: ad.description,
				price: ad.price ?? 0,
				author: ad.author?.username || ad.author || '—',
				created_at: ad.createdAt || ad.created_at || ''
			}));
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	});
</script>

<div class="container mx-auto py-10">
	<h1 class="h2 mb-8 text-center">BuildLink — маркетплейс объявлений</h1>

	{#if loading}
		<div class="text-center">
			<p>Загрузка объявлений...</p>
		</div>
	{:else if error}
		<div class="alert variant-filled-error">
			<p><strong>Ошибка:</strong> {error}</p>
		</div>
	{:else if ads.length === 0}
		<div class="text-center">
			<p>Объявлений пока нет. Станьте первым!</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each ads as ad}
				<div class="card p-4 shadow-md hover:shadow-xl transition-shadow flex flex-col gap-2">
					<h2 class="h4">{ad.title}</h2>
					<p class="text-sm text-surface-500 flex-grow">{ad.description}</p>
					<div class="flex justify-between items-center mt-2">
						<span class="font-bold text-lg">{ad.price.toLocaleString('ru-RU')} ₽</span>
						<span class="text-xs text-surface-400">@{ad.author}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
