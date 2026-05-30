<script setup lang="ts">
import logoProbuild from '~/assets/images/logo-probuild.png'

const teams = ref([{
  label: 'Probuild',
  avatar: {
    src: logoProbuild,
    alt: 'Probuild'
  }
}])
const selectedTeam = ref(teams.value[0])
</script>

<template>
  <UButton
      v-bind="{
        ...selectedTeam,
        label: selectedTeam?.label,
      }"
      color="neutral"
      variant="ghost"
      block
    />
</template>
