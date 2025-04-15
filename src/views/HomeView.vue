<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { Dashboard } from '@uppy/vue'
import '@uppy/core/dist/style.min.css'
import '@uppy/dashboard/dist/style.min.css'
import * as tus from 'tus-js-client'

const user = ref()
const users = ref([])
async function getUsers() {
  const { data, error } = await supabase.from('users').select()
  users.value = data
  console.log(data, error)
}
async function getUsersGraphQL() {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/graphql/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      query: `query {
  usersCollection(first: 1, filter: {id: {eq: 1}}) {
    edges {
      node {
        name
      }
    }
  }
}
  `,
      variables: {}
    })
  })
  const result = await response.json()
  console.log('graphQL', result)
}

const email = 'dev@visioncompliance.ch'
const otp = ref()
async function signin() {
  const { data, error } = await supabase.auth.signInWithOtp({
    email
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
    type: 'email'
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

async function callAPI(access_token) {
  const response = await fetch('http://localhost:3000/access', {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
  })
  console.log('API', await response.json())
}

async function upload(event) {
  const file = event.target.files[0]
  // uploadFile(file)
  const { data, error } = await supabase.storage.from('supabase').upload('public/test.png', file)
  console.log(data, error)
}

const uppy = new Uppy()
const initializeUppy = async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession()
  uppy
    .use(Tus, {
      endpoint: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/upload/resumable`, // Supabase TUS endpoint
      retryDelays: [0, 3000], // Retry delays for resumable uploads
      headers: {
        authorization: `Bearer ${session?.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, // API key for Supabase
        'x-upsert': 'true'
      },
      uploadDataDuringCreation: true, // Send metadata with file chunks
      removeFingerprintOnSuccess: true, // Remove fingerprint after successful upload
      chunkSize: 6 * 1024 * 1024, // Chunk size for TUS uploads (6MB)
      allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl'], // Metadata fields allowed for the upload
      onError: (error) => console.error('Upload error:', error) // Error handling for uploads
    })
    .on('file-added', (file) => {
      // Attach metadata to each file, including bucket name and content type
      console.log(file.meta)
      file.meta = {
        bucketName: 'supabase', // Bucket specified by the user of the hook
        objectName: file.name, // Use file name as object name
        contentType: file.type
      }
    })
}
initializeUppy()

async function uploadFile(file) {
  return new Promise((resolve, reject) => {
    file.metadata = null
    var upload = new tus.Upload(file, {
      endpoint: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000],
      headers: {
        authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'x-upsert': 'true' // optionally set upsert to true to overwrite existing files
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
      metadata: {
        bucketName: 'supabase',
        objectName: 'public/test.jpg',
        contentType: 'image/jpeg',
        cacheControl: '3600',
        metadata: JSON.stringify({
          test1: 'test1',
          test2: 'test2'
        })
      },
      chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
      onError: function (error) {
        console.log('Failed because: ' + error)
        reject(error)
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        console.log(bytesUploaded, bytesTotal, percentage + '%')
      },
      onSuccess: function () {
        console.log('Download %s from %s', upload.file.name, upload.url)
        resolve()
      }
    })
    // Check if there are any previous uploads to continue.
    return upload.findPreviousUploads().then(function (previousUploads) {
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0])
      }
      // Start the upload
      upload.start()
    })
  })
}

const img = ref()
async function download() {
  const { data, error } = await supabase.storage.from('supabase').download('public/test3.png')
  console.log(data, error)
  img.value = URL.createObjectURL(data)
}

supabase.auth.onAuthStateChange((event, session) => {
  console.log('onAuthStateChange', event, session)
  user.value = session?.user
  callAPI(session?.access_token)
})

onMounted(() => {
  getUsers()
  getUsersGraphQL()
  // callFunction()
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
    <input type="file" @change="upload" />
    <button @click="download">download</button>
    <img :src="img" />
    <Dashboard :uppy="uppy" />
  </ul>
</template>
