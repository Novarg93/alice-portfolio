<script setup lang="ts">
import { ref } from 'vue';
import PagePreloader from '../components/PagePreloader.vue';

defineProps<{ dialogOpen: boolean }>();
const loading = ref(true);
</script>

<template>
    <PagePreloader v-if="loading" @ready="loading = false" />
    <div class="app" :inert="loading || dialogOpen">
        <slot />
    </div>
    <slot name="dialog" />
</template>
