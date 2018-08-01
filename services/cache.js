const mongoose = require('mongoose');
const util = require('util');// from node
const redis = require('redis');
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);// rewrites redis 'get' function with one that returns a promise
const exec = mongoose.Query.prototype.exec;// ref to original mongoose 'exec' function

mongoose.Query.prototype.cache = function(options = {}) {// arrow function not used or else 'this' value will be incorrect
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;// makes function chainable like in mongoose query chains
}

mongoose.Query.prototype.exec = async function() {// overwrite Mongoose's 'exec' function to include redis use
    if (!this.useCache) {
        return exec.apply(this, arguments);// execute original 'exec' function if no caching flag present
    }
    const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));
    // check redis for cached items
    var cacheValue = await client.hget(this.hashKey, key);
    // if found, return
    if (cacheValue) {
        console.log('from cache');
        const doc = JSON.parse(cacheValue);
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))// need to return Mongoose document(s) so conversion from strings necessary
            : new this.model(doc)
    }
    console.log('from db');
    // if not found, query mongodb and store result in redis and return
    const result = await exec.apply(this, arguments);// 'this' is the current query is sent to mongodb. returns a Mongoose document
    // convert result to JSON and store in redis
    client.hset(this.hashKey, key, JSON.stringify(result));
    client.expire(this.hashKey, 60);// delete entry from redis after 60 seconds
    // finally return the Mongoose documents found in mongodb
    return result;
};

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}