<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{ slides: string[]; title: string }>();
const index = ref(0);
const track = ref(0);
const progress = ref(0);
const dragMode = ref<'swipe' | 'scrub' | null>(null);
const last = computed(() => props.slides.length - 1);
const percent = (position: number) => (last.value ? (100 * position) / last.value : 0) + '%';
const clamp = (position: number) => Math.max(0, Math.min(last.value, position));
let pointer: number | undefined;
let startingX = 0;
let swipeWidth = 1;

function go(position: number) {
    index.value = track.value = progress.value = clamp(position);
}

function start(mode: 'swipe' | 'scrub', event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0 || dragMode.value) return;
    const element = event.currentTarget as HTMLElement;
    pointer = event.pointerId;
    element.setPointerCapture(pointer);
    dragMode.value = mode;
    startingX = event.clientX;
    swipeWidth = element.offsetWidth || 1;
    if (mode === 'scrub') calculate(event);
}

function calculate(event: PointerEvent) {
    if (event.pointerId !== pointer) return;
    if (dragMode.value === 'swipe') {
        track.value = progress.value = clamp(index.value - (event.clientX - startingX) / swipeWidth);
    } else if (dragMode.value === 'scrub') {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        progress.value = clamp(((event.clientX - rect.left) / rect.width) * last.value);
        index.value = track.value = Math.round(progress.value);
    }
}

function finish(event: PointerEvent) {
    if (event.pointerId !== pointer) return;
    if (dragMode.value === 'swipe' && event.type === 'pointerup') {
        const delta = event.clientX - startingX;
        go(Math.abs(delta) > swipeWidth * 0.12 ? index.value + (delta < 0 ? 1 : -1) : index.value);
    } else {
        go(index.value);
    }
    pointer = undefined;
    dragMode.value = null;
}

function keys(event: KeyboardEvent) {
    const destinations: Record<string, number> = {
        ArrowRight: index.value + 1,
        ArrowUp: index.value + 1,
        ArrowLeft: index.value - 1,
        ArrowDown: index.value - 1,
        Home: 0,
        End: last.value,
    };
    const next = destinations[event.key];
    if (next === undefined) return;
    event.preventDefault();
    go(next);
}
</script>

<template>
    <div class="pgal">
        <div
            class="cover shot pslider"
            :class="{ drag: dragMode }"
            @pointerdown="start('swipe', $event)"
            @pointermove="calculate"
            @pointerup="finish"
            @pointercancel="finish"
            @lostpointercapture="finish"
        >
            <div class="ps-track" :style="{ transform: 'translateX(' + -100 * track + '%)' }">
                <img
                    v-for="(src, position) in slides"
                    :key="src"
                    :src="src"
                    :alt="title + ' — слайд ' + (position + 1)"
                    :aria-hidden="position !== index"
                    draggable="false"
                    decoding="async"
                />
            </div>
        </div>
        <div class="pgal-nav">
            <div class="pnav">
                <button
                    class="pb-arr pb-prev"
                    type="button"
                    aria-label="Предыдущий слайд"
                    :disabled="index === 0"
                    @click="go(index - 1)"
                >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                            d="M10 3.5 5.5 8l4.5 4.5"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
                <div
                    class="pbar"
                    :class="{ drag: dragMode }"
                    :style="{ '--p': percent(progress) }"
                    role="slider"
                    tabindex="0"
                    aria-label="Слайды проекта"
                    :aria-valuemin="1"
                    :aria-valuemax="slides.length"
                    :aria-valuenow="index + 1"
                    @pointerdown="start('scrub', $event)"
                    @pointermove="calculate"
                    @pointerup="finish"
                    @pointercancel="finish"
                    @lostpointercapture="finish"
                    @keydown="keys"
                >
                    <span class="pb-dots" aria-hidden="true"
                        ><i
                            v-for="(_, position) in slides"
                            :key="position"
                            :style="{ left: percent(position) }"
                        ></i
                    ></span>
                    <i class="pb-fill" aria-hidden="true"></i><i class="pb-knob" aria-hidden="true"></i>
                    <span class="ps-tip" aria-hidden="true"
                        ><svg viewBox="0 0 16 16" fill="none">
                            <path
                                d="M5 4.5 1.5 8 5 11.5M11 4.5 14.5 8 11 11.5"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            /></svg
                        >Потяните</span
                    >
                </div>
                <button
                    class="pb-arr pb-next"
                    type="button"
                    aria-label="Следующий слайд"
                    :disabled="index === last"
                    @click="go(index + 1)"
                >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                            d="M6 3.5 10.5 8 6 12.5"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>
