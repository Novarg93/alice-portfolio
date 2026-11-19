<script setup lang="ts">
import { experience } from '../../data/experience';
</script>

<template>
    <div class="sheet">
        <template v-for="(job, index) in experience" :key="job.title">
            <hr v-if="index > 0" class="exp-sep" />
            <div class="stack">
                <div class="exp-head">
                    <h2>{{ job.title }}</h2>
                    <span class="per">{{ job.period }}</span>
                </div>
                <span class="chip">
                    <img
                        v-if="job.company === 'Overgear'"
                        class="overgear-icon"
                        src="/images/icons/overgear.svg"
                        alt=""
                    />
                    {{ job.company }}
                </span>
            </div>
            <p class="txt">{{ job.description }}</p>
            <div class="stack">
                <h3>Задачи и результаты</h3>
                <ul class="pts">
                    <li v-for="point in job.points" :key="point">
                        <span>{{ point }}</span>
                    </li>
                </ul>
            </div>
        </template>
    </div>
</template>
