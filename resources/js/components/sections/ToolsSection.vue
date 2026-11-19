<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import { toolGroups } from '../../data/tools';

const host = useTemplateRef<HTMLElement>('host');
const available = ref(0);
const active = ref<string>();
const rotation = ref(0);
const sectorSize = ref(0);
const compact = computed(() => available.value < 700);
const step = 360 / toolGroups.reduce((total, group) => total + group.items.length + 1, 0);
const start = (-(toolGroups[0].items.length - 1) / 2) * step;
let observer: ResizeObserver;

const wheel = computed(() => {
    const radius = compact.value ? 168 : 280;
    const outer = radius + 34;
    const width = 2 * (radius + (compact.value ? 34 : 150));
    const height = 2 * outer + (compact.value ? 0 : 56);
    const core = compact.value ? 120 : 184;
    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(1, available.value / width);
    const point = (angle: number) => {
        const radians = (angle * Math.PI) / 180;
        const dx = Math.sin(radians);
        const dy = -Math.cos(radians);
        return { x: (cx + radius * dx).toFixed(1), y: (cy + radius * dy).toFixed(1), dx, dy };
    };
    const clamp = (value: number) => Math.max(-1, Math.min(1, value));
    let slot = 0;
    const groups = toolGroups.map((group) => {
        const first = start + slot * step;
        const last = first + (group.items.length - 1) * step;
        slot += group.items.length + 1;
        const p0 = point(first);
        const p1 = point(last);

        return {
            ...group,
            mid: (first + last) / 2,
            span: (group.items.length - 1 + 1.32) * step,
            arc: ['M', p0.x, p0.y, 'A', radius, radius, 0, 0, 1, p1.x, p1.y].join(' '),
            items: group.items.map((tool, i) => {
                const { x, y, dx, dy } = point(first + i * step);
                const distance = (26 / Math.max(Math.abs(dx), Math.abs(dy))) * 0.82 + 16;
                return {
                    ...tool,
                    x: x + 'px',
                    y: y + 'px',
                    labelStyle: {
                        left: (26 + dx * distance).toFixed(1) + 'px',
                        top: (26 + dy * distance).toFixed(1) + 'px',
                        transform:
                            'translate(' +
                            (-50 * (1 - clamp(dx * 2.2))).toFixed(1) +
                            '%,' +
                            (-50 * (1 - clamp(dy * 2.2))).toFixed(1) +
                            '%)',
                    },
                };
            }),
        };
    });

    return {
        width,
        height,
        groups,
        style: {
            width: width + 'px',
            height: height + 'px',
            transform: scale < 1 ? 'scale(' + scale + ')' : undefined,
            marginBottom: scale < 1 ? -(1 - scale) * height + 'px' : undefined,
        },
        wedge: {
            left: cx - outer + 'px',
            top: cy - outer + 'px',
            width: 2 * outer + 'px',
            height: 2 * outer + 'px',
            maskImage: 'radial-gradient(circle,transparent ' + core / 2 + 'px,#000 ' + (core / 2 + 1) + 'px)',
        },
        core: { left: cx - core / 2 + 'px', top: cy - core / 2 + 'px', width: core + 'px', height: core + 'px' },
    };
});
const activeGroup = computed(() =>
    wheel.value.groups.find((group) => group.items.some((tool) => tool.icon === active.value)),
);

function select(tool: string, group: { mid: number; span: number }) {
    active.value = tool;
    rotation.value += ((((group.mid - rotation.value) % 360) + 540) % 360) - 180;
    sectorSize.value = group.span;
}

function clear() {
    active.value = undefined;
}
function leave(event: PointerEvent) {
    if (event.pointerType !== 'touch') clear();
}
function blur(event: FocusEvent) {
    if (!(event.relatedTarget instanceof Node) || !host.value?.contains(event.relatedTarget)) clear();
}

onMounted(() => {
    if (!host.value) return;
    available.value = Math.max(1, host.value.clientWidth - 24);
    observer = new ResizeObserver(() => {
        if (host.value) available.value = Math.max(1, host.value.clientWidth - 24);
    });
    observer.observe(host.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
    <div class="tv">
        <div ref="host" class="tl-wheel" @focusout="blur">
            <div
                v-if="available"
                class="tw"
                :class="{ compact, act: activeGroup }"
                :data-g="activeGroup?.id"
                :style="wheel.style"
                @pointerleave="leave"
            >
                <svg class="tw-ring" :width="wheel.width" :height="wheel.height" aria-hidden="true">
                    <path
                        v-for="group in wheel.groups"
                        :key="group.id"
                        :class="{ on: activeGroup?.id === group.id }"
                        :stroke="group.color"
                        :stroke-width="compact ? 6 : 8"
                        :d="group.arc"
                    />
                </svg>
                <div
                    class="tw-wedge"
                    :style="{
                        ...wheel.wedge,
                        '--span': sectorSize + 'deg',
                        transform: 'rotate(' + rotation + 'deg)',
                    }"
                ></div>
                <div class="tw-core" :style="wheel.core" aria-live="polite">
                    <b>{{ activeGroup?.description ?? 'Инструменты' }}</b>
                </div>
                <template v-for="group in wheel.groups" :key="group.id">
                    <button
                        v-for="tool in group.items"
                        :key="tool.icon"
                        type="button"
                        class="tw-it"
                        :class="{ in: activeGroup?.id === group.id, on: active === tool.icon }"
                        :style="{ left: tool.x, top: tool.y }"
                        :aria-label="tool.label + (tool.tag ? ' (' + tool.tag + ')' : '') + ', ' + group.name"
                        @pointerenter="select(tool.icon, group)"
                        @focus="select(tool.icon, group)"
                        @click="select(tool.icon, group)"
                    >
                        <span class="tw-ico"><img :src="'/images/icons/' + tool.icon + '.svg'" alt="" /></span>
                        <span class="tw-pill" :style="tool.labelStyle" aria-hidden="true">{{ tool.label }}</span>
                    </button>
                </template>
            </div>
        </div>
    </div>
</template>
