import $ from './vendor/jquery-3.4.1.min'

const searchResultSelector = '.dl-search-result'
const searchTitleSelector = '.dl-search-result-title'
const nameSelector = '.dl-search-result-name'
const addressSelector = '.dl-text-body'

function processSearchResults() {
    const $searchResults = $(searchResultSelector)

    $('.doctoRating').remove()

    $searchResults.each((index, el) => {
        const name = $(el).find(nameSelector).text()
        const address = $(el).find(addressSelector).first().text()
        const searchString = name + " " + address

        getRating(searchString)
            .then((apiSearchResults) => displayRating($(el), apiSearchResults, searchString))
    })
}

function displayRating(el, apiSearchResults, searchString) {
    let result = ""
    let urlRedirect = ""

    if (apiSearchResults.status === "ZERO_RESULTS") {
        result = "No Results"
        urlRedirect = `https://www.google.com/maps/search/${searchString}/`
    } else if (apiSearchResults.status === "OVER_QUERY_LIMIT") {
        result = "Over quota, need money for the plugin"
        urlRedirect = "https://github.com/HugoGresse/doctorating"
    } else if (apiSearchResults.candidates.length > 1) {
        result = "Too Many Match"
        urlRedirect = `https://www.google.com/maps/search/${searchString}/`
    } else {
        const candidate = apiSearchResults.candidates[0]

        if (candidate.rating == 0) {
            result = "No notes yet"
        } else {
            result = `${candidate.rating}/5`
        }
        urlRedirect = `https://www.google.com/maps/place/?q=place_id:${candidate.place_id}`
    }

    el.find(searchTitleSelector).append(`<div class="doctoRating"><a target="_blank" href="${urlRedirect}">☆ Note: ${result}</a></div>`)
}

async function getRating(searchString) {
    return new Promise((resolve, reject) => {
        browser.runtime.sendMessage(
            { contentScriptQuery: "queryRating", searchString: searchString },
        )
            .then(result => {
                if (result.success) {
                    resolve(result.data)
                    return
                }
                reject('failed')
            })
            .catch(error => {
                console.error(error)
            })
    })
}

try {
    processSearchResults()
} catch (error) {
    console.error("DoctoRating error", error)
}