const {convertArrayToCSV} = require('convert-array-to-csv')
const fs = require('fs')

function printReport(pages){
  console.log("===========");
  console.log("   REPORT");
  console.log("===========");
  const sortedPages = sortPages(pages)

  console.log(sortedPages[0][0])
  const links = []
  const rights = []
  for (const sortedPage of sortedPages) {
    const url = sortedPage[0]
    const hits = sortedPage[1]
    links.push({[url]:hits})
    rights.push([url, hits])
    console.log(`Found ${hits} links to page: ${url}`);
  }

  const csvFromArr = convertArrayToCSV(rights, {
    header:['Url Path', 'Num of links'],
    separator:';'
  }) 
  fs.writeFileSync(`${sortedPages[0][0]}.txt`, JSON.stringify(links))
  fs.writeFileSync(`${sortedPages[0][0]}.csv`, csvFromArr)

  console.log("=============");
  console.log("END OF REPORT");
  console.log("=============");
}


function sortPages(pages) {
  const pagesArr = Object.entries(pages)
  pagesArr.sort((a,b) => {
    aHits = a[1]
    bHits = b[1]
    return b[1] - a[1]
  })

  return pagesArr
}

module.exports = {
  sortPages,
  printReport
}