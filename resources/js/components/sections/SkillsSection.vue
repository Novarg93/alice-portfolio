<script setup lang="ts">
import { computed } from 'vue';
import { hardSkills, softSkills } from '../../data/skills';
import TimelineList from './TimelineList.vue';

type SkillsSection = 'hard-skills' | 'soft-skills';
const props = defineProps<{ section: SkillsSection }>();
const emit = defineEmits<{ open: [section: SkillsSection] }>();
const skills = computed(() =>
    (props.section === 'hard-skills' ? hardSkills : softSkills).map(([label, description]) => ({
        label,
        description,
    })),
);
</script>

<template>
    <div class="sheet sk-sh">
        <div class="seg" role="group" aria-label="Тип навыков">
            <button type="button" :aria-pressed="section === 'hard-skills'" @click="emit('open', 'hard-skills')">
                Hard skills
            </button>
            <button type="button" :aria-pressed="section === 'soft-skills'" @click="emit('open', 'soft-skills')">
                Soft skills
            </button>
        </div>
        <TimelineList :items="skills" />
    </div>
</template>
