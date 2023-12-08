const fs = require('fs')
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

const input = fs.readFileSync(process.argv[2], { encoding: 'utf8' })
const parser = new XMLParser()
const data = parser.parse(input)

const daysHTML = findBigDivArray(data).slice(1)
const days = daysHTML.map(parseDay).filter(x => x && x[0])

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
    fs.writeFileSync(process.argv[2].replace('.html', '.json'), JSON.stringify(days, null, 2))
})

function parseDay(day) {
    const drilled = day.div.div.div
    try {
        const cols = drilled.slice(1).map(x => x.div.div).map(x => {
            const firstObj = Object.values(x)[0]
            if (!firstObj) return null
            const text = firstObj.span
            if (!text) return null
            return `${text}`
        })
        return cols
    } catch (e) {
        return null
    }
}

function findBigDivArray(xml) {
    if (!xml) return null
    if (Array.isArray(xml)) {
        if (xml.length > 10) return xml
        for (let i = 0; i < xml.length; i++) {
            const x = findBigDivArray(xml[i])
            if (x) return x
        }
        return null
    }
    return findBigDivArray(xml.div)
}