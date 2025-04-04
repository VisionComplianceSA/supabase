const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

router.get('/', function (req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }
  const accessToken = authHeader.split(' ')[1]
  supabase.auth.getUser(accessToken).then(({ data, error }) => {
    console.log('getUser', data, error)
    return res.json({ data, error })
  })
})

module.exports = router
