/**
 * @author commenthol
 * @copyright Unlicense
 */

const crypto = require('crypto')
const MapLRU = require('map-lru').default
const request = require('superagent')
const log = require('debug-level').log('pwnd')

const URL = 'https://api.pwnedpasswords.com/range/'

class Pwnd {
  /**
   * @constructor
   * @param {Number} [size=10000] - size of lru cache
   * @example
   * const Pwnd = require('is-password-pwned')
   * const pwnd = new Pwnd()
   * const num = await pwnd.get('nutella')
   * //> num = 20833
   */
  constructor (size = 10000) {
    this.map = new MapLRU(size)
  }

  /**
   * get password from lru cache or request it from pwnedpasswords.com
   * if `num === undefined` password hash could not be found in pwnedpasswords.com
   * @param {String} password - password to verify
   * @return await {Number} num - number of found hashes
   */
  get (password) {
    const hash = Pwnd.sha1(password)
    if (!this.map.has(hash)) {
      const prefix = Pwnd.prefix(hash)
      return this._range(prefix)
        .then(text => this._set(prefix, text))
        .then(() => this.map.get(hash))
    } else {
      return Promise.resolve(this.map.get(hash))
    }
  }

  /**
   * @private
   * range request against pwnd api
   */
  _range (prefix) {
    const url = URL + prefix
    return request.get(url)
      .retry(2)
      .then(res => res.text)
      .catch(err => {
        log.error(err, {url})
        return Promise.reject(err)
      })
  }

  /**
   * @private
   * set lru cache with fresh hashes
   * @param {String} prefix - 5char prefix
   * @param {String} text - response from pwndpasswords
   */
  _set (prefix, text = '') {
    text.split(/[\n\r]/)
      .filter(l => l)
      .forEach(line => {
        const [post, num] = line.split(/:/)
        const hash = `${prefix}${post}`
        this.map.set(hash, num)
      })
  }
}

/**
 * obtain 5char prefix from hash
 * @private
 */
Pwnd.prefix = (hash) => hash.substr(0, 5)

/**
 * sha1 hashed value of password
 * @private
 */
Pwnd.sha1 = (password) => {
  const hash = crypto.createHash('sha1')
  hash.update(password.toLowerCase())
  const digest = hash.digest('hex').toUpperCase()
  return digest
}

module.exports = Pwnd
