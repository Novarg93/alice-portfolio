<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

const props = defineProps<{ poster: string; src: string; label: string }>();
const video = useTemplateRef<HTMLVideoElement>('video');
const playing = ref(false);
let wanted = false;
let request = 0;
let motion: MediaQueryList | undefined;

async function play() {
    const player = video.value;
    if (!player) return;
    wanted = true;
    const attempt = ++request;
    if (!player.getAttribute('src')) player.src = props.src;
    player.muted = true;
    player.currentTime = 0;
    try {
        await player.play();
        if (attempt === request) playing.value = true;
    } catch {
        if (attempt === request) stop();
    }
}

function stop() {
    request++;
    wanted = false;
    playing.value = false;
    video.value?.pause();
}

function hover(event: PointerEvent) {
    if (event.pointerType === 'mouse' && !motion?.matches) void play();
}

function leave(event: PointerEvent) {
    if (event.pointerType === 'mouse') stop();
}

function toggle() {
    if (wanted) stop();
    else void play();
}

function motionChanged() {
    if (motion?.matches) stop();
}

onMounted(() => {
    motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    motion.addEventListener('change', motionChanged);
});
onBeforeUnmount(() => {
    motion?.removeEventListener('change', motionChanged);
    stop();
});
</script>

<template>
    <figure :class="{ play: playing }" @pointerenter="hover" @pointerleave="leave">
        <img :src="poster" alt="" loading="lazy" decoding="async" />
        <video ref="video" :poster="poster" preload="none" muted loop playsinline aria-hidden="true"></video>
        <button
            type="button"
            class="media-toggle absolute inset-0"
            :aria-label="label"
            :aria-pressed="playing"
            @click="toggle"
            @blur="stop"
        ></button>
    </figure>
</template>
