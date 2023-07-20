const {JSDOM} = require('jsdom')

async function crawlPage(baseUrl, currentURL, pages) {
  const baseURLObj = new URL(baseUrl)
  const currentURLObj = new URL(currentURL)
  if (baseURLObj.hostname !== currentURLObj.hostname) return pages

  const normalizeCurrentURL = normalizeURL(currentURL)
  if (pages[normalizeCurrentURL] > 0) {
    pages[normalizeCurrentURL]++
    return pages
  }

  pages[normalizeCurrentURL] = 1

  console.log(`actively crawling: ${currentURL}`);
  try {
    const resp = await fetch(currentURL)

    if (resp.status > 399) {
      console.log(`error in fetch with status code: ${resp.status}, on page: ${currentURL}`)
      return pages
    }

    const contentType = resp.headers.get("content-type")
    if (!contentType.includes("text/html")){
      console.log(`non html response, content-type recived: ${contentType}, on page: ${currentURL}`)
      return pages
    }

    const htmlBody = await resp.text()

    const nextURLs = getURLsFromHTML(htmlBody, baseUrl)

    for (const nextURL of nextURLs){
      pages = await crawlPage(baseUrl, nextURL, pages)
    }
    return pages
  } catch (error) {
    console.log(`Error in fetch: ${error}, on page: ${currentURL}`)
  }
  
}

function getURLsFromHTML(htmlBody, baseURL) {
  const urls = []
  const dom = new JSDOM(htmlBody)
  const linkElements = dom.window.document.querySelectorAll('a')
  for (const linkElement of linkElements) {
    if (linkElement.href.slice(0, 1) === '/'){
      //relative
      try{
        const urlObj = new URL(`${baseURL}${linkElement.href}`) 
        urls.push(urlObj.href)
      }  catch (err) {
        console.log(`Error with relative url: ${err.message}`)
      }
    } else {
      //absolutetry
      try{
        const urlObj = new URL(linkElement.href) 
        urls.push(urlObj.href)
      }  catch (err) {
        console.log(`Error with relative url: ${err.message}`)
      }
    }
  }
  return urls
}

function normalizeURL(urlString) {
  const urlObj = new URL(urlString)
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`
  if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
    return hostPath.slice(0,-1)
  }
  return hostPath
}

module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage
}