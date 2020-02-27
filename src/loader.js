const fs = require('fs')

const JSON_CACHE = 'p:/work/javascript/scraper/cache/demons.json'

exports.load = (() => {
  let demons = JSON.parse(fs.readFileSync(JSON_CACHE, 'utf8'))

  let familyMap = {}

  Object.keys(demons).forEach((key) => {
    let demon = demons[key]
    let race = demon.stats.Race
    if (demon.familyCombinations !== undefined &&
      demon.familyCombinations.length !== 0 &&
      demon.familyCombinations[0][0] !== 'None') {
      if (familyMap[race] === undefined) {
        familyMap[race] = []
      }
      for (let fc of demon.familyCombinations) {
        // don't insert duplicates
        found = false
        for (let fc2 of familyMap[race]) {
          if (
            (fc2[0] === fc[0] && fc2[1] === fc[1]) ||
            (fc2[1] === fc[0] && fc2[0] === fc[1])
          ) {
            found = true
            break
          }
        }
        if (!found) {
          familyMap[race].push(fc)
        }
      }
    }
  })

  return {
    demons: demons,
    familyMap: familyMap
  }
})