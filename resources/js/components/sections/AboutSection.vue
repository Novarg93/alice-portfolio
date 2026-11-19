<script setup lang="ts">
import { biography, education } from '../../data/about';
import MediaTile from './MediaTile.vue';
import TimelineList from './TimelineList.vue';

const media = [
    { poster: 'yoga', video: 'yoga-2', label: 'Йога на воде' },
    { poster: 'cat', video: 'cat', label: 'Видео с котом' },
    { poster: 'fortress', video: 'fortress', label: 'Видео у крепости' },
    { poster: 'it-picnic', video: 'it-picnic', label: 'ИТ-пикник' },
];
</script>

<template>
    <div class="sheet">
        <div class="abtx">
            <p v-for="paragraph in biography" :key="paragraph">{{ paragraph }}</p>
        </div>
        <div class="abph">
            <MediaTile
                v-for="item in media"
                :key="item.video"
                :poster="'/images/about-' + item.poster + '.webp'"
                :src="'/videos/' + item.video + '.mp4'"
                :label="item.label"
            />
        </div>
        <div class="abed">
            <h4>Образование и курсы</h4>
            <TimelineList class="crs-ed" :items="education" />
        </div>
    </div>
</template>
