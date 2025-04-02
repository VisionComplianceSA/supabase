<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const user = ref()
const users = ref([])
async function getUsers() {
  const { data, error } = await supabase.from('users').select()
  users.value = data
  console.log(data, error)
}

const email = 'dev@visioncompliance.ch'
const otp = ref()
async function signin() {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  })
  console.log(data, error)
}
async function signout() {
  const { data, error } = await supabase.auth.signOut()
  user.value = null
  console.log(data, error)
}
async function verifyOTP() {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp.value,
    type: 'email',
  })
  user.value = data.user
  console.log(data, error)
}

async function callFunction() {
  const { data, error } = await supabase.functions.invoke('hello-world', {
    body: { name: 'Functions' }
  })
  console.log(data, error)
}

onMounted(() => {
  getUsers()
  callFunction()
  supabase.auth.getUser().then(({ data, error }) => {
    user.value = data.user
    console.log('getUser', data, error)
  })
})
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    <button v-if="user" @click="signout">signout</button>
    <button v-else @click="signin">signin</button>
    otp
    <input type="text" v-model="otp" />
    <button @click="verifyOTP">verify</button>
  </ul>
</template>
