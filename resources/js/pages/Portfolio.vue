<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import PortfolioBoard from '../components/board/PortfolioBoard.vue';
import PortfolioDialog from '../components/PortfolioDialog.vue';
import PortfolioLayout from '../layouts/PortfolioLayout.vue';
import AboutSection from '../components/sections/AboutSection.vue';
import ProjectsSection from '../components/sections/ProjectsSection.vue';
import ProjectSection from '../components/sections/ProjectSection.vue';
import SkillsSection from '../components/sections/SkillsSection.vue';
import ToolsSection from '../components/sections/ToolsSection.vue';
import ExperienceSection from '../components/sections/ExperienceSection.vue';
import { isProject } from '../data/projects';
import { readSection } from '../data/sections';
import type { Section } from '../data/sections';

const section = ref<Section | null>(null);
let returnFocus: HTMLElement | null = null;
let returnScroll = 0;

function syncHash() {
    const next = readSection(window.location.hash);
    if (next && !section.value) {
        returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        returnScroll = window.scrollY;
    }
    const closing = !next && section.value;
    section.value = next;

    if (closing) {
        void nextTick(() => {
            if (section.value) return;
            window.scrollTo(0, returnScroll);
            if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
            returnFocus = null;
        });
    }
}

function open(next: Section | null) {
    if (next === section.value) return;
    if (next) {
        window.location.hash = next;
    } else {
        // Keep the original hash history, without jumping to the top of the mobile board.
        window.history.pushState(window.history.state, '', window.location.pathname + window.location.search);
        syncHash();
    }
}

onMounted(() => {
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);
    syncHash();
});
onBeforeUnmount(() => {
    window.removeEventListener('hashchange', syncHash);
    window.removeEventListener('popstate', syncHash);
});
</script>

<template>
    <PortfolioLayout :dialog-open="section !== null">
        <PortfolioBoard :section="section" @open="open" />
        <template #dialog>
            <PortfolioDialog v-if="section" :section="section" @close="open(null)">
                <AboutSection v-if="section === 'about'" />
                <ProjectsSection v-else-if="section === 'projects'" @open="open" />
                <ProjectSection v-else-if="isProject(section)" :key="section" :id="section" @open="open" />
                <SkillsSection
                    v-else-if="section === 'hard-skills' || section === 'soft-skills'"
                    :section="section"
                    @open="open"
                />
                <ToolsSection v-else-if="section === 'tools'" />
                <ExperienceSection v-else-if="section === 'experience'" />
            </PortfolioDialog>
        </template>
    </PortfolioLayout>
</template>
