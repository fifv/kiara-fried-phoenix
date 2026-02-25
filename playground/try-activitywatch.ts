

async function main() {
    const url = `http://localhost:5600/api/0/buckets/aw-watcher-window_Fifv-ThinkBook/events?start=${encodeURIComponent('2026-02-01T13:56:55+08:00')}&end=${encodeURIComponent('2026-02-01T17:56:55+08:00')}&limit=-1`
    console.log(url)
    fetch(url).then(async (data) => {
        const d = await data.json()
        console.log(d)
    })
}
main()