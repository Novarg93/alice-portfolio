<script setup lang="ts">
defineProps<{ src: string; alt: string }>();
</script>

<template>
    <span class="cover shot"><img :src="src" :alt="alt" width="832" height="340" /></span>
</template>
