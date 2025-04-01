<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const users = ref([])
async function getUsers() {
  const { data } = await supabase.from('users').select()
  users.value = data
}

const email = 'dev@visioncompliance.ch'
const otp = ref()
async function signin() {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  })
  console.log(data, error)
}
async function verifyOTP() {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp.value,
    type: 'email',
  })
  console.log(data, error)
}

onMounted(() => {
  getUsers()
  supabase.auth.getUser().then((user) => {
    console.log('getUser', user)
  })
})
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    <button @click="signin">signin</button>
    otp
    <input type="text" v-model="otp" />
    <button @click="verifyOTP">verify</button>
  </ul>
</template>
