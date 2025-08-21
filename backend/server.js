require('dotenv').config()            // load BASE_URL from backend/.env
const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

// If you had any hard-coded/default profiles routes – remove them here!
// e.g.:
// app.get('/match', (_, res) => res.json({ top_profiles: [ /* … */ ] }))

// dynamic proxy to your AI endpoint
app.post('/match', async (req, res) => {
  try {
    // forward the incoming payload to BASE_URL + "match"
    const aiResp = await axios.post(
      `${process.env.BASE_URL}match`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    )

    // return only the top_profiles array
    console.log("Successfully fetched profiles from AI endpoint")
    return res.json({ top_profiles: aiResp.data.top_profiles })
  }
  catch (err) {
    console.error('Error proxying /match →', err.message)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Meeting scheduling endpoint
app.post('/schedule-meeting', async (req, res) => {
  try {
    console.log('Received meeting scheduling request:', req.body)

    // Use organizer email from environment variables
    const organizer_email = process.env.ORG_EMAIL
    console.log('Organizer email from env:', organizer_email)

    if (!organizer_email) {
      return res.status(500).json({
        error: 'ORG_EMAIL not configured in environment variables'
      })
    }

    // Validate required fields
    const { subject, attendees, start_time, duration_minutes } = req.body

    if (!subject || !attendees || !start_time || !duration_minutes) {
      return res.status(400).json({
        error: 'Missing required fields: subject, attendees, start_time, duration_minutes'
      })
    }

    if (!Array.isArray(attendees) || attendees.length === 0) {
      return res.status(400).json({
        error: 'Attendees must be a non-empty array'
      })
    }

    // Forward the request to the AI endpoint with organizer email from env
    // Convert the datetime format to what the AI endpoint expects
    let formattedStartTime = start_time

    try {
      const date = new Date(start_time)

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format')
      }

      // Format as YYYY-MM-DDTHH:mm:ss without milliseconds or Z
      // The AI endpoint seems to expect local time format
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      // Format without timezone info, as Python's fromisoformat expects local time
      formattedStartTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`

      console.log(`Converted datetime from '${start_time}' to '${formattedStartTime}'`)

    } catch (dateError) {
      console.error('Error converting datetime format:', dateError)
      // Keep original format if conversion fails
      formattedStartTime = start_time
    }

    const payload = {
      organizer_email,
      subject,
      attendees,
      start_time: formattedStartTime,
      duration_minutes
    }

    console.log('Sending payload to AI endpoint:', JSON.stringify(payload, null, 2))

    const aiEndpointUrl = `${process.env.BASE_URL}schedule-meeting`
    console.log('AI endpoint URL:', aiEndpointUrl)

    // Temporary workaround: Mock the response since AI endpoint has a bug
    // Remove this when the AI endpoint is fixed
    console.log('WARNING: Using mock response due to AI endpoint bug')
    const mockResponse = {
      success: true,
      meeting_id: `mock_meeting_${Date.now()}`,
      message: 'Meeting scheduled successfully (MOCK)',
      organizer: organizer_email,
      subject: payload.subject,
      attendees: payload.attendees,
      start_time: payload.start_time,
      duration_minutes: payload.duration_minutes
    }

    // console.log("Mock meeting response:", mockResponse)
    // return res.json(mockResponse)

    //Uncomment this section when AI endpoint is fixed:
    const aiResp = await axios.post(
      aiEndpointUrl,
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 30 second timeout
      }
    )

    console.log("Successfully scheduled meeting via AI endpoint")
    return res.json(aiResp.data)

  }
  catch (err) {
    console.error('Error proxying /schedule-meeting →', err.message)

    // Log more detailed error information
    if (err.response) {
      console.error('Error response status:', err.response.status)
      console.error('Error response data:', err.response.data)
      return res.status(err.response.status).json({
        error: err.response.data?.error || 'External service error',
        details: err.response.data
      })
    }

    console.error('Full error object:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Interview questions generation endpoint
app.post('/generate-questions', async (req, res) => {
  try {
    console.log('Received interview questions request:', req.body)

    // Validate required fields
    const { job_description, profile_summary } = req.body

    if (!job_description) {
      return res.status(400).json({
        error: 'Missing required field: job_description'
      })
    }

    // Forward the request to the AI endpoint
    // const aiEndpointUrl = `${process.env.BASE_URL}generate-questions`
    const aiEndpointUrl = `http://127.0.0.1:8000/generate-questions`
    console.log('AI endpoint URL for questions:', aiEndpointUrl)

    const payload = {
      job_description,
      profile_summary // <-- add this field
    }

    const aiResp = await axios.post(
      aiEndpointUrl,
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 30 second timeout
      }
    )

    console.log("Successfully fetched interview questions from AI endpoint")
    return res.json({ questions: aiResp.data.questions })

  } catch (err) {
    console.error('Error proxying /get-questions →', err.message)

    // Log more detailed error information
    if (err.response) {
      console.error('Error response status:', err.response.status)
      console.error('Error response data:', err.response.data)
      return res.status(err.response.status).json({
        error: err.response.data?.error || 'External service error',
        details: err.response.data
      })
    }

    console.error('Full error object:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Backend proxy listening on http://localhost:${PORT}`)
})

const path = require('path');  // Add this at the top with your other requires

app.use(express.static(path.join(__dirname, 'frontend/build')));

// Catch-all route for client-side routing (serve index.html for any unmatched GET requests)
app.get('/*any', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});