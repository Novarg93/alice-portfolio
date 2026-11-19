<script setup lang="ts">
export type TimelineItem = { label: string; description?: string; year?: string };

defineProps<{ items: readonly TimelineItem[] }>();
</script>

<template>
    <ol class="crs">
        <li v-for="item in items" :key="item.label">
            <i aria-hidden="true"></i>
            <div>
                <b>{{ item.label }}</b
                ><small v-if="item.description">{{ item.description }}</small>
            </div>
            <span v-if="item.year">{{ item.year }}</span>
        </li>
    </ol>
</template>
