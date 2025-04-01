<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const users = ref([])
async function getUsers() {
  const { data } = await supabase.from('users').select()
  users.value = data
}
onMounted(() => {
  getUsers()
})
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
