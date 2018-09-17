const http = require('http')
const url  = require('url')
const StringDecoder = require('string_decoder').StringDecoder

const server = http.createServer((req, res) => {

  // Get the url and parse it
  const parsedUrl = url.parse(req.url, true)

  // Get the path
  const path = parsedUrl.pathname

  const trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query string as an object
  const queryStringObject = parsedUrl.query

  // Get the HTTP method
  const method = req.method.toLowerCase()

  // Get the headers as an object
  const headers = req.headers

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8')
  let buffer = ''

  req.on('data', data => {
    buffer += decoder.write(data)
  })

  req.on('end', () => {
    buffer += decoder.end()

    res.end('Hello World\n')

    console.log(`Request received with this payload: `, buffer)
  })

  // Send the response
  // res.end('Hello World\n')

  // Log the request path
  // console.log(`Requests received with these headers`, headers)
  // console.log(`Request received on path : ${trimmedPath} with method ${method} and with these query string parameteres `, queryStringObject)
})

server.listen(3000, () => {
  console.log('The server is listening on port 3000 now')
})
