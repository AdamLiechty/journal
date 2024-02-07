const fs = require('fs')

const input = fs.readFileSync(process.argv[2], { encoding: 'utf8' })
const startArg = process.argv[3]
const start = startArg ? +startArg : 0
const startDateArg = process.argv[4]
const startDate = startDateArg ? new Date(startDateArg) : new Date()
startDate.setTime(startDate.getTime() + 12*60*60*1000)

const lines = input.split('\n').slice(start)
let book = null
const days = lines.map(parseLine).map(day => {
    const date = day.day.toString().substring(4,10).replace(' 0', ' ')
    return [date, `${day.book} ${day.chapters}`, day.psalm, day.video]
})
function parseLine(line, index) {
    const parts = line.split(' ')
    const day = addDays(startDate, index)
    parts.shift()
    if (!(parts[0].match(/^[0-9]+-/) || parts[0].match(/^[0-9]+$/) && parts[1].match(/^[0-9]+/))) {
        book = parts.shift().replace(/_/g, ' ')
    }
    const chapters = parts.shift()
    const psalm = parts.shift()
    const video = parts.join(' ') || null
    console.log([book, chapters, psalm, video])
    return {day, book, chapters, psalm, video}
}
console.log(days)

const bpChannelId = 'UCVfwlh9XpX2Y_tQfjeln9QA'
const yt = require('./google')

const ytSearches = days.map(day => {
    const video = day[3]
    if (!video) return Promise.resolve(null)
    return yt.search(bpChannelId, video).then(result => {
        const hit = result?.data?.items[0]
        if (hit) {
            return {
                videoId: hit.id.videoId,
                title: hit.snippet.title,
                description: hit.snippet.description,
                thumbnails: hit.snippet.thumbnails,
                channelTitle: hit.snippet.channelTitle
            }
        }
        return { error: true, result }
    })
})

Promise.all(ytSearches).then(results => {
    results.forEach((result, index) => {
        days[index][4] = result
    })
    fs.writeFileSync(process.argv[2].replace('.txt', '.json'), JSON.stringify(days, null, 2))
})


function addDays(startDate, days) {
    var date = new Date(startDate.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
