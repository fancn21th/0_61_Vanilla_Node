/**
*  Request handlers
*/

// Dependencies
const _data = require('./data')
const helpers = require('./helpers')

// Define the handlers

const handlers = {}

const getValueByNestedFieldName = (data, name) => {
  const nestedNames = name.split('.')
  let value = data
  nestedNames.forEach(nestedName => {
    value = value[nestedName]
  })
  return value && value.trim()
}

const getValueFromQuerystring = (data, name) => {
  return data.queryStringObject[name] && data.queryStringObject[name].trim()
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
  const phone = getValueByNestedFieldName(data, 'payload.phone').length == 11 ? getValueByNestedFieldName(data, 'payload.phone') : false
  const firstName = getValueByNestedFieldName(data, 'payload.firstName')
  const lastName = getValueByNestedFieldName(data, 'payload.lastName')
  const password = getValueByNestedFieldName(data, 'payload.password')
  const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user doesn't already exist
    _data.read('users', phone, (err, data) => {
      if(err) {
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
// Required data: phone
// TODO: Only authenticated user access granted
handlers._users.get = (data, callback) => {
  // Check that the phone number is valid
  const phone = getValueFromQuerystring(data, 'phone').length == 11 ? getValueFromQuerystring(data, 'phone') : false
  if (phone) {
    // Lookup the user
    _data.read('users', phone, (err, data) => {
      if(!err && data) {
        // Remove the hashed password from the user object before returning it to the requester
        delete data.hashedPassword
        callback(200, data)
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, {
      'Error': 'Missing required field'
    })
  }
}

// Users - Put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// TODO: Only authenticated user access granted
handlers._users.put = (data, callback) => {
  // Check for the required field
  const phone = getValueByNestedFieldName(data, 'payload.phone').length == 11 ? getValueByNestedFieldName(data, 'payload.phone') : false

  // Check for the optional fields
  const firstName = getValueByNestedFieldName(data, 'payload.firstName')
  const lastName = getValueByNestedFieldName(data, 'payload.lastName')
  const password = getValueByNestedFieldName(data, 'payload.password')

  // Error if the phone is invalid
  if(phone) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      // Lookup the user
      _data.read('users', phone, (err, userData) => {
        if(!err && userData) {
          // Update the fields necessary
          if (firstName) {
            userData.firstName = firstName
          }
          // Update the fields necessary
          if (lastName) {
            userData.lastName = lastName
          }
          // Update the fields necessary
          if (password) {
            userData.hashedPassword = helpers.hash(password)
          }
          // Store the new updates
          _data.update('users', phone, userData, err => {
            if(!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, {
                'Error': 'Could not update the user'
              })
            }
          })
        } else {
          callback(400, {
            'Error': 'The specified user does not exist'
          })
        }
      })
    } else {
      callback(400, {
        'Error': 'Missing fields to update'
      })
    }
  } else {
    callback(400, {
      'Error': 'Missing required field'
    })
  }

}

// Users - delete
// Required data: phone
// TODO: Only authenticated user access granted
// TODO: Delete any other data files associated with this user
handlers._users.delete = (data, callback) => {
  // Check that the phone number is valid
  const phone = getValueFromQuerystring(data, 'phone').length == 11 ? getValueFromQuerystring(data, 'phone') : false
  if (phone) {
    // Lookup the user
    _data.delete('users', phone, (err, data) => {
      if(!err && data) {
        _data.delete('users', phone, err => {
          if (!err) {
            callback(200)
          } else {
            callback(500, {
              'Error': 'Could not delete the specified user'
            })
          }
        })
      } else {
        callback(400, {
          'Error': 'Could not find the specified user'
        })
      }
    })
  } else {
    callback(400, {
      'Error': 'Missing required field'
    })
  }
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
