const Webhook = require('standardwebhooks')
const nodemailer = require('nodemailer')
const express = require('express')
const router = express.Router()

const subjects = {
  en: {
    magiclink: 'Your custom Magic Link'
  },
  fr: {
    magiclink: 'Votre Lien Magique'
  }
}

const templates = {
  en: {
    magiclink: '<h2>Magic Link</h2><p>Follow this link to login:</p><p><a href="{{confirmation_url}}">Log In</a></p><p>Alternatively, enter the code: {{token}}</p>'
  },
  fr: {
    magiclink: '<h2>Votre Lien Magique</h2><p>Suivez ce lien pour vous connecter :</p><p><a href="{{confirmation_url}}">Connectez-vous</a></p><p>Vous pouvez aussi saisir le code : {{token}}</p>'
  }
}

function generateConfirmationURL (email_data) {
  // TODO: replace the ref with your project ref
  return `http://127.0.0.1:54321/auth/v1/verify?token=${email_data.token}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`
}

router.post('/', async function (req, res, next) {
  console.log('singin')
  const payload = JSON.stringify(req.body)
  const headers = req.headers
  const base64Secret = process.env.SEND_EMAIL_HOOK_SECRET.replace('v1,whsec_', '')
  const wh = new Webhook.Webhook(base64Secret)
  const { user, email_data } = wh.verify(payload, headers)

  const language = (user.user_metadata && user.user_metadata.i18n) || 'en'
  const subject = subjects[language][email_data.email_action_type] || 'Notification'

  const template = templates[language][email_data.email_action_type]
  const confirmationUrl = generateConfirmationURL(email_data)
  const htmlBody = template
    .replace('{{confirmation_url}}', confirmationUrl)
    .replace('{{token}}', email_data.token || '')
    .replace('{{new_token}}', email_data.new_token || '')
    .replace('{{site_url}}', email_data.site_url || '')
    .replace('{{old_email}}', email_data.email || '')
    .replace('{{new_email}}', email_data.new_email || '')

  try {
    const transporter = nodemailer.createTransport({
      host: 'mail.infomaniak.com',
      port: 465,
      secure: true,
      auth: {
        user: 'dev@visioncompliance.ch',
        pass: process.env.EMAIL_PW
      }
    })
    const mailOptions = {
      from: 'test<dev@visioncompliance.ch>',
      to: user.email,
      subject,
      html: htmlBody
    }
    await transporter.sendMail(mailOptions)
    console.log('email sent')
    res.status(200).json({
      message: 'Email sent successfully.'
    })
    return
  } catch (error) {
    console.log(error)
    res.send(error.message)
  }
})

module.exports = router
