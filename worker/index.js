const keys = require('./keys')
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000 // try to connect again every second on connection loss.
})

const sub = redisClient.duplicate()

const fib = (index) => {
  if (index < 2) return 1
  return fib(index - 1) + fib(index - 2)
}

// channel will be 'insert' as we use .publish with the 'insert' channel in server/index.js, and message will be the new number to calculate.
sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fib(parseInt(message)))
})

sub.subscribe('insert')