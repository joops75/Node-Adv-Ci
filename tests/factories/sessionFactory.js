const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const key = require('../../config/keys');
const keygrip = new Keygrip([key.cookieKey]);

module.exports = user => {// 'user' is a mongoose model
    const sessionObject = {
        passport: {
            user: user._id.toString()// '_id' is a js object
        }
    };
    const session = Buffer.from(
        JSON.stringify(sessionObject)
    ).toString('base64');
    const sig = keygrip.sign('session=' + session);

    return { session, sig }
}