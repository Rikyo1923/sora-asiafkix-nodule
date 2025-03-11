const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://asiaflix.net";

// Function to search for movies/shows
async function search(query) {
    try {
        const response = await axios.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
        const $ = cheerio.load(response.data);
        let results = [];

        $(".film_list-wrap .flw-item").each((i, element) => {
            let title = $(element).find(".film-detail a").text().trim();
            let url = BASE_URL + $(element).find(".film-detail a").attr("href");
            let poster = $(element).find(".film-poster img").attr("src");

            results.push({ title, url, poster });
        });

        return results;
    } catch (error) {
        console.error("Search Error:", error);
        return [];
    }
}

// Function to get movie/show details
async function getDetails(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        let title = $(".film-name").text().trim();
        let description = $(".description").text().trim();
        let poster = $(".film-poster img").attr("src");

        let episodes = [];
        $(".episodes-list a").each((i, element) => {
            let epTitle = $(element).text().trim();
            let epUrl = BASE_URL + $(element).attr("href");
            episodes.push({ epTitle, epUrl });
        });

        return { title, description, poster, episodes };
    } catch (error) {
        console.error("Details Error:", error);
        return null;
    }
}

// Function to extract streaming link
async function getStreamUrl(episodeUrl) {
    try {
        const response = await axios.get(episodeUrl);
        const $ = cheerio.load(response.data);

        let iframeSrc = $("iframe").attr("src");
        return iframeSrc ? iframeSrc : "Streaming link not found";
    } catch (error) {
        console.error("Stream URL Error:", error);
        return null;
    }
}

// Example usage (for testing)
(async () => {
    let searchResults = await search("The King");
    console.log("Search Results:", searchResults);

    if (searchResults.length > 0) {
        let details = await getDetails(searchResults[0].url);
        console.log("Details:", details);

        if (details.episodes.length > 0) {
            let streamUrl = await getStreamUrl(details.episodes[0].epUrl);
            console.log("Streaming URL:", streamUrl);
        }
    }
})();

module.exports = { search, getDetails, getStreamUrl };
