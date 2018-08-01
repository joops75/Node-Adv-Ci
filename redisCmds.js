const redis = require('redis')
const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)

client.hset('german', 'red', 'rot')
client.hget('german', 'red', console.log)
client.set('colors', { red: 'rojo' })
client.get('colors', console.log)
// add { color: 'red' } and expire this entry after 5 seconds
client.set('color', 'red', 'EX', 5)

client.hset('german', 'red', 'rot')// client.hset('german', 'red', 'rot', 'EX', 5) won't work for hset
client.expire('german', 5)
client.hget('german', 'red', console.log)

// to clear redis store
client.flushall()