<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const emit = defineEmits<{ ready: [] }>();
const progress = ref(0);
const outgoing = ref(false);
const point = ref<{ x: number; y: number }>();
const angles = [-18, 28, 72, 118, 160, 205, 248, 294];
let target = { x: 0, y: 0 };
let frame = 0;
let exitTimer = 0;
let finishTimer = 0;
let fontsReady = false;

function follow(event: PointerEvent) {
    if (event.pointerType !== 'touch') target = { x: event.clientX, y: event.clientY };
}

onMounted(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 300 : 1600;
    const start = performance.now();
    let shown = 0;
    point.value = target = { x: innerWidth / 2, y: innerHeight / 2 };
    document.documentElement.classList.add('is-loading');
    void document.fonts.ready.then(() => {
        fontsReady = true;
    });
    if (!reduced) {
        window.addEventListener('pointermove', follow, { passive: true });
        window.addEventListener('pointerdown', follow, { passive: true });
    }

    function tick(now: number) {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const ready = elapsed >= 6000 || (fontsReady && document.readyState === 'complete');
        const eased = 100 * (1 - (1 - t) ** 2.2);
        const cap = ready ? 100 : fontsReady ? 90 : 70;
        shown += (Math.min(cap, eased) - shown) * (reduced ? 1 : 0.12);
        progress.value = ready && t === 1 && shown > 99.5 ? 100 : Math.floor(shown);

        if (point.value && !reduced) {
            point.value = {
                x: point.value.x + (target.x - point.value.x) * 0.16,
                y: point.value.y + (target.y - point.value.y) * 0.16,
            };
        }
        if (progress.value < 100) {
            frame = requestAnimationFrame(tick);
            return;
        }

        exitTimer = window.setTimeout(
            () => {
                outgoing.value = true;
                document.documentElement.classList.remove('is-loading');
                finishTimer = window.setTimeout(() => emit('ready'), reduced ? 0 : 900);
            },
            reduced ? 0 : 380,
        );
    }

    frame = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    window.clearTimeout(exitTimer);
    window.clearTimeout(finishTimer);
    window.removeEventListener('pointermove', follow);
    window.removeEventListener('pointerdown', follow);
    document.documentElement.classList.remove('is-loading');
});
</script>

<template>
    <div
        id="preload"
        class="preload"
        :class="{ done: progress === 100, out: outgoing }"
        role="progressbar"
        aria-label="Загрузка страницы"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="progress"
    >
        <div
            class="pl-core"
            :style="point ? { transform: 'translate(' + point.x + 'px,' + point.y + 'px)' } : undefined"
        >
            <div class="pl-rays" aria-hidden="true">
                <i
                    v-for="(angle, index) in angles"
                    :key="angle"
                    :class="{ on: index < Math.round((progress / 100) * angles.length) }"
                    :style="{ '--a': angle + 'deg' }"
                ></i>
            </div>
            <span class="pl-num">{{ progress }}%</span>
        </div>
    </div>
</template>
