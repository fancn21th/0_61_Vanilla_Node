/**
*  Request handlers
*/

// Dependencies
const _data = require('./data')
const helpers = require('./helpers')

// Define the handlers

const handlers = {}

const getValueByFiledName = (data, name) => {
  const nestedNames = name.split('.')
  let value = data
  nestedNames.forEach(nestedName => {
    value = value[nestedName]
  })
  return (value && value.trim()) || false
}

handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback)
  } else {
    callback(405)
  }
}

// Container for the users submethods
handlers._users = {}

// Users - Post
// Required data: firstName, lastName, phone, password, tosAgreements
// Optional data: none
handlers._users.post = (data, callback) => {

  // Check that all required fields are filled out
  const firstName = getValueByFiledName(data, 'payload.firstName')
  const lastName = getValueByFiledName(data, 'payload.lastName')
  const phone = getValueByFiledName(data, 'payload.phone').length == 11 ? getValueByFiledName(data, 'payload.phone') : false
  const password = getValueByFiledName(data, 'payload.password')
  const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user doesn't already exist
    _data.read('users', phone, (err, data) => {
      if(!err) {
        // Hash the password
        const hashedPassword = helpers.hash(password)

        if (hashedPassword) {
          // Create the user object
          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true
          }

          // Store the user
          _data.create('users', phone, userObject, err => {
            if(!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, {
                'Error': 'Could not create the new user'
              })
            }
          })
        } else {
          callback(500, {
            'Error': 'Could not hash the user'
          })
        }

      } else {
        // User already exists
        callback(400, {
          'Error': 'A user with that phone number already exists'
        })
      }
    })

  } else {
    callback(400, {
      'Error': 'Missing required fields'
    })
  }

}

// Users - Get
handlers._users.get = (data, callback) => {

}

// Users - Put
handlers._users.put = (data, callback) => {

}

// Users - delete
handlers._users.delete = (data, callback) => {

}

// Ping handler
handlers.ping = (data, callback) => {
  // Callback a http status code, and a payload object
  callback(200)
}

handlers.notFound = (data, callback) => {
  callback(404)
}

// Export the module
module.exports = handlers
