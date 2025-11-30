
const bookChapterCounts = {
    'romans': 16,
    'genesis': 50
}

const bookNameMap = {
    'romans': 'Romans',
    'genesis': 'Genesis'
}

function calculateSchedule(topic, duration) {
    const normalizedTopic = topic.toLowerCase().replace(/book of /g, '').replace(/the /g, '').trim()
    const isBookStudy = bookChapterCounts[normalizedTopic] !== undefined
    const totalChapters = isBookStudy ? bookChapterCounts[normalizedTopic] : 0

    console.log(`Topic: "${topic}"`)
    console.log(`Normalized: "${normalizedTopic}"`)
    console.log(`Is Book Study: ${isBookStudy}`)
    console.log(`Total Chapters: ${totalChapters}`)
    console.log(`Duration: ${duration}`)

    if (!isBookStudy) return []

    const preDefinedSchedule = []
    const ratio = totalChapters / duration
    let currentChapter = 1

    for (let day = 1; day <= duration; day++) {
        let endChapter = Math.round(day * ratio)

        if (day === duration) {
            endChapter = totalChapters;
        } else if (endChapter < currentChapter) {
            endChapter = currentChapter;
        }

        const start = currentChapter
        const end = endChapter

        let ref = ''
        if (start === end) {
            ref = `${bookNameMap[normalizedTopic] || topic} ${start}`
        } else {
            ref = `${bookNameMap[normalizedTopic] || topic} ${start}-${end}`
        }

        preDefinedSchedule.push({
            day_number: day,
            reading_reference: ref,
            chapters: [start, end]
        })

        currentChapter = end + 1
    }

    return preDefinedSchedule
}

const schedule = calculateSchedule("Book of Romans", 7)
console.log(JSON.stringify(schedule, null, 2))
