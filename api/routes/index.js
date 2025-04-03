const express = require('express')
const path = require('path')
const router = express.Router()

router.use(express.static(path.join(__dirname, '../../dist')))

/* GET home page. */
router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../../dist/index.html'))
})

module.exports = router
