<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue';
import { projectIds, projects } from '../../data/projects';
import type { ProjectId } from '../../data/projects';
import ProjectCover from './ProjectCover.vue';
import ProjectGallery from './ProjectGallery.vue';

const props = defineProps<{ id: ProjectId }>();
const emit = defineEmits<{ open: [project: ProjectId] }>();
const project = computed(() => projects[props.id]);
const index = computed(() => projectIds.indexOf(props.id));
const prev = computed(() => projectIds[(index.value + projectIds.length - 1) % projectIds.length]);
const next = computed(() => projectIds[(index.value + 1) % projectIds.length]);
const slides = computed(() =>
    Array.from({ length: project.value.slideCount }, (_, i) =>
        i === 0 && project.value.coverIsFirstSlide
            ? project.value.cover
            : '/images/' + props.id + '-slide-' + (i + 1) + '.webp',
    ),
);
const moreButton = useTemplateRef<HTMLButtonElement>('moreButton');
const expanded = ref(false);
const galleryLoaded = ref(false);
let pendingScroll = 0;

function scrollToDetails() {
    if (!pendingScroll) return;
    window.clearTimeout(pendingScroll);
    pendingScroll = 0;
    const button = moreButton.value;
    const dialog = button?.closest<HTMLElement>('.modal-card');
    if (!expanded.value || !button || !dialog) return;
    dialog.scrollTo({
        top: Math.max(
            0,
            button.getBoundingClientRect().top - dialog.getBoundingClientRect().top + dialog.scrollTop - 16,
        ),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
}

function toggleDetails() {
    expanded.value = !expanded.value;
    window.clearTimeout(pendingScroll);
    pendingScroll = 0;
    if (!expanded.value) return;
    galleryLoaded.value = true;
    pendingScroll = window.setTimeout(scrollToDetails, 450);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) void nextTick(scrollToDetails);
}
onBeforeUnmount(() => window.clearTimeout(pendingScroll));
</script>

<template>
    <div class="sheet">
        <h2>{{ project.label }}</h2>
        <ProjectCover :src="project.cover" :alt="project.label" />
        <div class="pmeta">
            <a class="chip lnk" :href="project.link.url" target="_blank" rel="noopener">
                <img
                    :class="{ 'web-icon': project.link.label === 'Website' }"
                    :src="
                        project.link.label === 'Website' ? '/images/icons/website.svg' : '/images/icons/figma.svg'
                    "
                    alt=""
                />
                <span>{{ project.link.label }}</span>
            </a>
            <span class="pyear"
                ><span class="pyl">Год запуска –</span> <b>{{ project.year }}</b></span
            >
        </div>
        <p class="txt">{{ project.description }}</p>
        <div class="stack">
            <h3>Ключевые решения</h3>
            <ul class="pts">
                <li v-for="[label, point] in project.points" :key="label">
                    <span
                        ><b>{{ label }}</b> {{ point }}</span
                    >
                </li>
            </ul>
        </div>
        <button
            ref="moreButton"
            class="more-t"
            type="button"
            :aria-expanded="expanded"
            aria-controls="project-details"
            @click="toggleDetails"
        >
            Подробнее<svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                    d="M3 5.5 7 9.5 11 5.5"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </button>
        <div
            id="project-details"
            class="more-b"
            :class="{ open: expanded }"
            :inert="!expanded"
            @transitionend.self="scrollToDetails"
        >
            <div>
                <div class="case">
                    <div>
                        <h4>Бизнес-задача</h4>
                        <p class="txt">{{ project.details.business }}</p>
                    </div>
                    <div>
                        <h4>Контекст</h4>
                        <p class="txt">{{ project.details.context }}</p>
                    </div>
                    <div>
                        <h4>Гипотеза</h4>
                        <p class="txt">{{ project.details.hypothesis }}</p>
                    </div>
                    <div>
                        <h4>Решение</h4>
                        <ol class="crs cs-steps">
                            <li v-for="step in project.details.solution" :key="step">
                                <i aria-hidden="true"></i>
                                <div>{{ step }}</div>
                            </li>
                        </ol>
                    </div>
                    <ProjectGallery v-if="galleryLoaded" :slides="slides" :title="project.label" />
                </div>
            </div>
        </div>
        <div class="pager">
            <button type="button" @click="emit('open', prev)">
                <svg class="pg-a" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                        d="M16 10H4m5-5-5 5 5 5"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
                <span class="pg-t"
                    ><span>предыдущий</span><b>{{ projects[prev].label }}</b></span
                >
            </button>
            <button type="button" @click="emit('open', next)">
                <span class="pg-t"
                    ><span>следующий</span><b>{{ projects[next].label }}</b></span
                >
                <svg class="pg-a" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                        d="M4 10h12m-5-5 5 5-5 5"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
        </div>
    </div>
</template>
