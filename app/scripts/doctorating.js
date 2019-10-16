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
        urlRedirect = "github link" // TODO
    } else if (apiSearchResults.candidates.length > 1) {
        result = "Too Many Match"
        urlRedirect = `https://www.google.com/maps/search/${searchString}/`
    } else {
        const candidate = apiSearchResults.candidates[0]

        result = `${candidate.rating}/5`
        urlRedirect = `https://www.google.com/maps/place/?q=place_id:${candidate.place_id}`
    }

    el.find(searchTitleSelector).append(`<div class="doctoRating"><a target="_blank" href="${urlRedirect}">☆ Note: ${result}</a></div>`)
}

async function getRating(searchString) {
    const gmapApiSearchString = encodeURIComponent(searchString)

    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${gmapApiSearchString}&inputtype=textquery&fields=name,rating,place_id&key=${process.env.GOOGLE_PLACES_API_KEY}`

    try {
        const response = await fetch(url)
        if (response.ok) {
            return response.json()
        }
        else {
            throw new Error("Fail to get rating from Google")
        }
    }
    catch (error) {
        console.error(error);
    }
}

try {
    processSearchResults()
} catch (error) {
    console.error("DoctoRating error", error)
}