const keys = require('./keys')


// Express app setup
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json());

// Postgres client setup
const { Pool } = require("pg")
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
})

// Create a 'values' table with one column called 'number' which must be an int.
pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});


// Redis client setup
const redis = require('redis')
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
})
const redisPublisher = redisClient.duplicate()

// Express route handlers
app.get('/', (req, res) => {
  res.send('hi')
})

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values')
  res.send(values.rows)
})

app.get('/values/current', (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values)
  })
})

app.post('/values', async (req, res) => {
  const { index } = req.body

  if (parseInt(index) > 40) {
    // Prevent receiving high numbers as calculating them would probably take too long. Return status code 422 (Unprocessable Entity)
    return res.status(422).send('Index too high')
  }

  // Set a placeholder value in redis just to express that we received this number and our worker is calculating it. 
  // This line is not mandatory for the publish() to work.
  redisClient.hset('values', index, 'Our worker has not calculated this index yet!')
  redisPublisher.publish('insert', index)

  // POSTGRES INSERT QUERY EXPLANATION: The $1 is a placeholder, meaning you're going to provide a value 
  // to this placeholder at the end of the query, after the last comma. You can have multiple placeholders, 
  // you're going to name them $2, $3 and so on. See node-postgres.com/features/queries#parameterized-query for more info.
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index])
  res.send({ working: true })
})

const port = 5000
app.listen(port, err => {
  console.log("Listening on port " + port)
})