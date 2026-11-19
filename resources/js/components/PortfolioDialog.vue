<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue';
import { sectionLabel } from '../data/sections';
import type { Section } from '../data/sections';

const props = defineProps<{ section: Section }>();
const emit = defineEmits<{ close: [] }>();
const dialog = useTemplateRef<HTMLElement>('dialog');
const close = useTemplateRef<HTMLButtonElement>('close');

function handleKeys(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault();
        emit('close');
        return;
    }
    if (event.key !== 'Tab' || !dialog.value) return;
    const items = Array.from(
        dialog.value.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]'),
    ).filter((item) => item.getClientRects().length && !item.closest('[inert]'));
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
    }
}

onMounted(() => {
    document.documentElement.classList.add('modal-open');
    close.value?.focus({ preventScroll: true });
});
onBeforeUnmount(() => document.documentElement.classList.remove('modal-open'));

watch(
    () => props.section,
    () => {
        if (dialog.value) dialog.value.scrollTop = 0;
        if (!dialog.value?.contains(document.activeElement)) close.value?.focus({ preventScroll: true });
    },
    { flush: 'post' },
);
</script>

<template>
    <div id="modal" class="modal" :class="{ mid: section === 'tools' }" @click.self="emit('close')">
        <div
            ref="dialog"
            class="modal-card"
            :class="{ wide: section === 'tools' }"
            role="dialog"
            aria-modal="true"
            :aria-label="sectionLabel(section)"
            @keydown="handleKeys"
        >
            <button ref="close" type="button" class="modal-close" aria-label="Закрыть" @click="emit('close')">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                        d="M3 3l10 10M13 3 3 13"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                    />
                </svg>
            </button>
            <div class="view" aria-live="polite"><slot /></div>
        </div>
    </div>
</template>
