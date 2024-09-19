<template>
	<section class="logs-list">
		<template v-if="logs.length">
			TEST
		</template>
	</section>
</template>

<script setup>
import { computed } from 'vue'
import Log from '../../models/Log.js'

const logs = computed(() => Log.getAllLogs())
</script>
