<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch, ref } from 'vue';
import { useBoardLayout } from '../../composables/useBoardLayout';
import { isProject } from '../../data/projects';
import { folders, menuItems, sectionLabel } from '../../data/sections';
import type { FolderId, Section } from '../../data/sections';
import FolderArt from './FolderArt.vue';
import PortfolioHero from './PortfolioHero.vue';
import ResetIcon from './ResetIcon.vue';

const props = defineProps<{ section: Section | null }>();
const emit = defineEmits<{ open: [section: Section] }>();
const board = useTemplateRef<HTMLElement>('board');
const hero = useTemplateRef('hero');
const heroElement = computed<HTMLElement | null>(() => hero.value?.$el ?? null);
const menuButton = useTemplateRef<HTMLButtonElement>('menuButton');
const menuArea = useTemplateRef<HTMLElement>('menuArea');
const cursorText = useTemplateRef<HTMLElement>('cursorText');
const menuOpen = ref(false);
const spinning = ref(false);
const cursor = ref({ visible: false, pressed: false, x: 0, y: 0, label: '', width: 96 });
const folderIds = Object.keys(folders) as FolderId[];
const { narrow, place, remember, reset } = useBoardLayout(board, heroElement);
const zIndex = ref<Partial<Record<FolderId, number>>>({});
const dragging = ref<FolderId | null>(null);
const tilt = ref(0);
const navSection = computed(() =>
    isProject(props.section) ? 'projects' : props.section === 'soft-skills' ? 'hard-skills' : props.section,
);
let depth = 10;
let spinTimer = 0;
let drag: {
    id: FolderId;
    pointer: number;
    left: number;
    top: number;
    x: number;
    y: number;
    lastX: number;
} | null = null;
let suppressClick: FolderId | null = null;

watch(
    () => props.section,
    (id) => {
        if (id && folderIds.includes(id as FolderId)) zIndex.value[id as FolderId] = ++depth;
    },
    { immediate: true },
);

function openFromMenu(section: Section) {
    menuOpen.value = false;
    menuButton.value?.focus();
    emit('open', section);
}

function dismissMenu(event: MouseEvent) {
    if (event.target instanceof Node && !menuArea.value?.contains(event.target)) menuOpen.value = false;
}

function closeMenu(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !menuOpen.value) return;
    event.preventDefault();
    menuOpen.value = false;
    menuButton.value?.focus();
}

function tidy() {
    window.clearTimeout(spinTimer);
    spinning.value = false;
    void nextTick(() => {
        spinning.value = true;
        spinTimer = window.setTimeout(() => {
            spinning.value = false;
        }, 520);
    });
    reset();
}

function pointerDown(id: FolderId, event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick = null;
    zIndex.value[id] = ++depth;
    if (narrow()) return;
    const element = event.currentTarget as HTMLButtonElement;
    element.setPointerCapture(event.pointerId);
    drag = {
        id,
        pointer: event.pointerId,
        left: element.offsetLeft,
        top: element.offsetTop,
        x: event.clientX,
        y: event.clientY,
        lastX: event.clientX,
    };
}

function pointerMove(id: FolderId, event: PointerEvent) {
    if (!drag || drag.id !== id || drag.pointer !== event.pointerId || !board.value) return;
    const element = event.currentTarget as HTMLButtonElement;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!dragging.value && Math.hypot(dx, dy) <= 5) return;
    if (!dragging.value) element.classList.add('dragging');
    dragging.value = id;
    const { offsetWidth: w, offsetHeight: h } = element;
    const x = Math.max(-w * 0.3, Math.min(board.value.clientWidth - w * 0.7, drag.left + dx));
    const y = Math.max(-h * 0.3, Math.min(board.value.clientHeight - h * 0.7, drag.top + dy));
    place(element, x, y);
    tilt.value = Math.max(-10, Math.min(10, (event.clientX - drag.lastX) * 0.8));
    drag.lastX = event.clientX;
}

function pointerEnd(id: FolderId, event: PointerEvent) {
    if (!drag || drag.id !== id || drag.pointer !== event.pointerId) return;
    if (dragging.value) {
        const element = event.currentTarget as HTMLButtonElement;
        remember(id, element);
        suppressClick = id;
        element.classList.remove('dragging');
    }
    drag = null;
    dragging.value = null;
    tilt.value = 0;
}

function openFolder(id: FolderId, event: MouseEvent) {
    if (suppressClick === id && event.detail !== 0) {
        suppressClick = null;
        return;
    }
    emit('open', id);
}

function nudge(id: FolderId, event: KeyboardEvent) {
    const step = event.shiftKey ? 40 : 8;
    const directions: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
    };
    const delta = directions[event.key];
    if (!delta || !board.value) return;
    event.preventDefault();
    const element = event.currentTarget as HTMLButtonElement;
    place(
        element,
        Math.max(
            8,
            Math.min(board.value.clientWidth - element.offsetWidth - 8, parseFloat(element.style.left) + delta[0]),
        ),
        Math.max(
            8,
            Math.min(
                board.value.clientHeight - element.offsetHeight - 8,
                parseFloat(element.style.top) + delta[1],
            ),
        ),
    );
    remember(id, element);
}

function moveCursor(event: PointerEvent) {
    if (!board.value || event.pointerType === 'touch') {
        cursor.value.visible = false;
        return;
    }
    const rect = board.value.getBoundingClientRect();
    const element = event.target instanceof Element ? event.target.closest<HTMLElement>('.obj') : null;
    const id = element?.dataset.id as FolderId | undefined;
    const label = id && id !== dragging.value ? (element?.dataset.tip ?? folders[id].name) : '';
    Object.assign(cursor.value, {
        visible: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        label,
    });
}

watch(
    () => cursor.value.label,
    () => {
        if (cursorText.value) cursor.value.width = cursorText.value.scrollWidth + 28;
    },
    { flush: 'post' },
);

function releaseCursor() {
    cursor.value.pressed = false;
}

onMounted(() => {
    document.addEventListener('click', dismissMenu);
    window.addEventListener('pointerup', releaseCursor);
    window.addEventListener('pointercancel', releaseCursor);
});
onBeforeUnmount(() => {
    document.removeEventListener('click', dismissMenu);
    window.removeEventListener('pointerup', releaseCursor);
    window.removeEventListener('pointercancel', releaseCursor);
    window.clearTimeout(spinTimer);
});
</script>

<template>
    <main class="stage" aria-label="Playground: предметы, которые можно двигать и открывать" @keydown="closeMenu">
        <div
            ref="board"
            class="board"
            @pointermove="moveCursor"
            @pointerleave="cursor.visible = false"
            @pointerdown="cursor.pressed = true"
        >
            <div ref="menuArea" class="quick tl" @pointerdown.stop>
                <button
                    id="burger"
                    ref="menuButton"
                    type="button"
                    class="burger"
                    :aria-expanded="menuOpen"
                    aria-controls="bmenu"
                    aria-label="Меню"
                    @click="menuOpen = !menuOpen"
                >
                    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                        <rect x="0" y="1" width="22" height="3" rx="1.5" />
                        <rect x="0" y="14" width="32" height="3" rx="1.5" />
                        <rect x="10" y="28" width="22" height="3" rx="1.5" />
                    </svg>
                </button>
                <nav id="bmenu" class="bmenu" aria-label="Разделы" :hidden="!menuOpen">
                    <button
                        v-for="[id, label] in menuItems"
                        :key="id"
                        type="button"
                        :aria-current="navSection === id"
                        @click="openFromMenu(id)"
                    >
                        {{ label }}
                    </button>
                </nav>
                <button
                    id="tidy"
                    type="button"
                    class="reload"
                    :class="{ spin: spinning }"
                    data-tip="Разложить заново"
                    aria-label="Разложить заново"
                    @click="tidy"
                >
                    <ResetIcon />
                </button>
            </div>

            <PortfolioHero ref="hero" />

            <button
                v-for="id in folderIds"
                :key="id"
                type="button"
                class="obj"
                :class="{ active: section === id, dragging: dragging === id }"
                :data-id="id"
                :data-tip="'tip' in folders[id] ? folders[id].tip : undefined"
                :style="{
                    '--r': folders[id].rotation + 'deg',
                    '--tilt': (dragging === id ? tilt : 0) + 'deg',
                    zIndex: zIndex[id],
                }"
                :aria-label="isProject(id) ? folders[id].name : sectionLabel(id)"
                aria-haspopup="dialog"
                @pointerdown="pointerDown(id, $event)"
                @pointermove="pointerMove(id, $event)"
                @pointerup="pointerEnd(id, $event)"
                @pointercancel="pointerEnd(id, $event)"
                @lostpointercapture="pointerEnd(id, $event)"
                @click="openFolder(id, $event)"
                @keydown="nudge(id, $event)"
            >
                <FolderArt :id="id" />
                <span class="frame" aria-hidden="true">
                    <i v-for="corner in 4" :key="corner"></i><b class="dim"></b>
                </span>
            </button>

            <div
                class="cursor"
                aria-hidden="true"
                :class="{ on: cursor.visible, hover: cursor.label, press: cursor.pressed }"
                :style="{ transform: 'translate3d(' + cursor.x + 'px,' + cursor.y + 'px,0)' }"
            >
                <div class="cur-arrow">
                    <i></i
                    ><svg viewBox="0 0 26 28">
                        <path
                            d="M5.2 3.4 C4 2.6 2.6 3.5 2.8 4.9 L5.6 23.6 C5.8 25 7.6 25.4 8.4 24.2 L12.2 18.6 C12.6 18 13.2 17.7 13.9 17.7 L20.6 17.5 C22 17.5 22.6 15.7 21.5 14.8 Z"
                            fill="none"
                            stroke="rgba(255,255,255,.75)"
                            stroke-width="1"
                        />
                    </svg>
                </div>
                <div class="cur-pill" :style="{ '--pw': cursor.width + 'px' }">
                    <span ref="cursorText"
                        ><b>{{ cursor.label }}</b
                        ><svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                        >
                            <path d="M12 5v14M5 12h14" /></svg
                    ></span>
                </div>
            </div>
        </div>
    </main>
</template>
