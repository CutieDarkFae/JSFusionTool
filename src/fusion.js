const load = require('./loader')

let { demons, familyMap } = load.load()

const getDemonFamily = ((desiredRace) => {
  let demonFamily = []
  for (let key of Object.keys(demons)) {
    if (demons[key].stats.Race === desiredRace) {
      demonFamily.push(demons[key])
    }
  }
  // now sort by level
  demonFamily = demonFamily.sort((a, b) => {
    if (parseInt(a.stats.Level) < parseInt(b.stats.Level)) return -1
    if (parseInt(a.stats.Level) > parseInt(b.stats.Level)) return 1
    return 0
  })
  return demonFamily
})

const getReverseFusings = ((desired) => {
  let desiredDemon = undefined

  for (let key of Object.keys(demons)) {
    if (demons[key].name === desired) {
      desiredDemon = demons[key]
      break
    }
  }
  if (desiredDemon === undefined) {
    console.log(`Unable to find desired demon ${desired}`)
  }

  let demonFamily = getDemonFamily(desiredDemon.stats.Race)

  let desiredDemonIndex = -1
  for (let i = 0; i < demonFamily.length; i++) {
    if (demonFamily[i].name == desiredDemon.name) {
      desiredDemonIndex = i
      break
    }
  }
  if (desiredDemonIndex === -1) {
    console.log(`Unable to find desired demon ${desiredDemon.name} in family`)
  }

  let fusionRangeLower = 2
  if (desiredDemonIndex !== 0) {
    fusionRangeLower = parseInt(demonFamily[desiredDemonIndex - 1].stats.Level) * 2
  }

  let fusionRangeUpper = 200
  if (desiredDemonIndex !== demonFamily.length - 1) {
    fusionRangeUpper = parseInt(desiredDemon.stats.Level) * 2 - 1
  }

  let possibleCombinations = []
  let fusionCost = Math.floor(Math.pow(parseInt(desiredDemon.stats.Level), 2) / 2)

  familyMap[desiredDemon.stats.Race].forEach(combo => {
    let family1 = getDemonFamily(combo[0])
    let family2 = getDemonFamily(combo[1])
    family1.forEach(demon1 => {
      family2.forEach(demon2 => {
        let combinedLevel = parseInt(demon1.stats.Level) + parseInt(demon2.stats.Level)
        if (fusionRangeLower <= combinedLevel && combinedLevel <= fusionRangeUpper) {
          possibleCombinations.push({
            demon1: demon1,
            demon2: demon2
          })
        }
      })
    })
  })

  console.log(`Can fuse ${desiredDemon.name} for cost of ${fusionCost}`)
  console.log(`With ${possibleCombinations.length} possibilities`)
  possibleCombinations.forEach(combo => {
    console.log(`${combo.demon1.name} and ${combo.demon2.name}`)
  })
  return {
    name: desired,
    cost: fusionCost,
    combos: possibleCombinations
  }
})

const populateNode = ((combos, node) => {
  combos.forEach(combo => {
    node.nodes.push({
      l: { 
        name: combo.demon1.name,
        nodes: []
      },
      r: {
        name: combo.demon2.name,
        nodes: []
      }
    })
  })
})

const processNode = ((node) => {
  node.nodes.forEach(node => {
    doProcessNode(node.l)
    doProcessNode(node.r)
  })
})

let cache = {}
const doProcessNode = ((node => {
  if (node.nodes.length == 0) {
    let fcombos = []
    if (cache[node.name] !== undefined) {
      fcombos = cache[node.name]
    } else {
      let {name, cost, combos} = getReverseFusings(node.name)
      cache[node.name] = combos
      fcombos = combos
    }
    if (fcombos.length != 0) {
      populateNode(fcombos, node)
      processNode(node)
    }
  } else {
    node.nodes.forEach(node2 => {
      processNode(node2)
    })
  }
}))

let tree = {
  name: 'Artemis',
  nodes: []
}

doProcessNode(tree)
console.log(JSON.stringify(tree))