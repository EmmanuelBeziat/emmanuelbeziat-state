<template>
	<div class="page">
		<header class="header">
			<h1 class="header-title">Emmanuel Béziat <span>Logs</span></h1>
		</header>

		<main class="main">
			<LogList />
		</main>

		<footer class="footer">
			©️Emmanuel Béziat
		</footer>
	</div>
</template>

<script setup>
import LogList from './components/LogList.vue'
</script>
