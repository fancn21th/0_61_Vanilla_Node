/**
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto')
const config = require('../config')

// Container for all helpers
const helpers = {}

// Create a SHA256 hash
helpers.hash = str => {
  if (typeof(str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
    return hash
  } else {
    return false
  }
}

// Parse a JSON string to an object in call cases, without throwing
helpers.parseJsonToObject = str => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return {}
  }
}

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = strLength => {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false
  if(strLength) {
    // Define all the posible characters that could go into a string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz'

    // Start the final string
    let str = ''
    for(let i=1;i<= strLength;i++) {
      // Get a random character from the possibleCharacters string
      const randomCharacter =
        possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
      // Append this character to the final string
      str += randomCharacter
    }

    return str
  }
  return false
}

// Export the module
module.exports = helpers
