<script setup lang="ts">
import { projectIds, projects } from '../../data/projects';
import type { ProjectId } from '../../data/projects';
import ProjectCover from './ProjectCover.vue';

const emit = defineEmits<{ open: [project: ProjectId] }>();
</script>

<template>
    <div class="sheet">
        <h2>Избранные проекты</h2>
        <div class="stack">
            <button v-for="id in projectIds" :key="id" type="button" class="row mini" @click="emit('open', id)">
                <ProjectCover :src="projects[id].cover" alt="" />
                <span class="t"
                    >{{ projects[id].label }}<small>{{ projects[id].type }} · {{ projects[id].year }}</small></span
                >
                <span class="k" aria-hidden="true">→</span>
            </button>
        </div>
    </div>
</template>
