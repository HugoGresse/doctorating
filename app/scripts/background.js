browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => new Promise((resolve, reject) => {
        if (request.contentScriptQuery == "queryRating") {
            const gmapApiSearchString = encodeURIComponent(request.searchString)

            const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${gmapApiSearchString}&inputtype=textquery&fields=name,rating,place_id&key=${process.env.GOOGLE_PLACES_API_KEY}`

            return fetch(url)
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    }
                    return null
                })
                .then(json => {
                    if (json) {
                        resolve({
                            success: true,
                            data: json
                        })
                        return
                    }
                    resolve({
                        success: false,
                    })
                })
                .catch(error => {
                    console.error(error)
                    resolve({
                        success: false,
                    })
                })
        }
    })
)