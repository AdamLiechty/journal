const { API_KEY, CLIENT_ID } = require('./keys.json')
const { google } = require('googleapis')

const yt = google.youtube({
    version: 'v3',
    auth: API_KEY
})

exports.search = function search(channelId, q) {
    return yt.search.list({ q, channelId, part: 'snippet' })
}
