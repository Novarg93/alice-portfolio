<script setup lang="ts">
import AboutFolderArt from './AboutFolderArt.vue';
import ExperienceFolderArt from './ExperienceFolderArt.vue';
import SkillsFolderArt from './SkillsFolderArt.vue';
import { computed } from 'vue';
import { folders } from '../../data/sections';
import type { FolderId } from '../../data/sections';
import { isProject } from '../../data/projects';

const props = defineProps<{ id: FolderId }>();
const project = computed(() => isProject(props.id));
const toolIcons = ['fi', 'fr', 'ps', 'mj', 'gpt', 'cl', 'no', 'gm'];
</script>

<template>
    <span class="art folder" :class="{ 'f-white': project }" aria-hidden="true">
        <svg class="f-back" viewBox="0 0 176 142">
            <defs>
                <linearGradient :id="'fb-' + id" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="var(--f1)" :stop-opacity="project ? 0.55 : 0.5" />
                    <stop offset="1" stop-color="var(--f2)" :stop-opacity="project ? 0.3 : 0.28" />
                </linearGradient>
            </defs>
            <path
                d="M12 4H56Q61 4 64.5 7.5L71 14H164Q172 14 172 22V130Q172 138 164 138H12Q4 138 4 130V12Q4 4 12 4Z"
                :fill="'url(#fb-' + id + ')'"
                stroke="var(--fs)"
                stroke-opacity=".7"
                stroke-width="1.2"
            />
        </svg>
        <span v-if="id !== 'about'" class="f-paper"></span>
        <span v-if="project" class="f-card f-hero">
            <img class="fc-shot" :src="'/images/' + id + '-folder.webp'" alt="" />
        </span>
        <AboutFolderArt v-else-if="id === 'about'" />
        <SkillsFolderArt v-else-if="id === 'hard-skills'" />
        <ExperienceFolderArt v-else-if="id === 'experience'" />
        <span v-else class="f-card">
            <span class="fc-tools">
                <span v-for="icon in toolIcons" :key="icon" class="t">
                    <img :src="'/images/icons/' + icon + '.svg'" alt="" />
                </span>
            </span>
        </span>
        <span class="f-front">
            <span class="f-blur"></span>
            <svg viewBox="0 0 176 142" preserveAspectRatio="none">
                <defs>
                    <linearGradient :id="'ff-' + id" x1="0" y1="0" x2=".35" y2="1">
                        <stop
                            offset="0"
                            :stop-color="project ? '#fff' : '#9cc2ff'"
                            :stop-opacity="project ? 0.62 : 0.42"
                        />
                        <stop offset=".45" stop-color="var(--f1)" :stop-opacity="project ? 0.36 : 0.2" />
                        <stop offset="1" stop-color="var(--f2)" :stop-opacity="project ? 0.5 : 0.34" />
                    </linearGradient>
                </defs>
                <path
                    d="M12 56H96Q101 56 104.5 52.5L109 48Q112.5 44 117.5 44H164Q172 44 172 52V130Q172 138 164 138H12Q4 138 4 130V64Q4 56 12 56Z"
                    :fill="'url(#ff-' + id + ')'"
                    stroke="var(--fs)"
                    stroke-width="1.4"
                />
            </svg>
            <svg v-if="id === 'about'" class="f-smile" viewBox="0 0 20 20">
                <g fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round">
                    <path d="M5.5 11.5a5 5 0 0 0 9 0" />
                    <path d="M7 7v.6M13 7v.6" />
                </g>
            </svg>
            <b class="f-name">{{ folders[id].name }}</b>
        </span>
    </span>
</template>
