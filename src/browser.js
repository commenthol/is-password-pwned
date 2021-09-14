/**
 * @author commenthol
 * @copyright Unlicense
 */

import { URL } from './constants.js'

class Pwnd {
  /**
   * @constructor
   * @example
   * impoer Pwnd = require('is-password-pwned')
   * const pwnd = new Pwnd()
   * const num = await pwnd.get('nutella')
   * //> num = 20833
   */
  constructor () {
    this.map = new Map()
  }

  /**
   * get password from lru cache or request it from pwnedpasswords.com
   * if `num === undefined` password hash could not be found in pwnedpasswords.com
   * @param {String} password - password to verify
   * @return await {Number} num - number of found hashes
   */
  async get (password) {
    const hash = await Pwnd.sha1(password)
    if (!this.map.has(hash)) {
      const prefix = Pwnd.prefix(hash)
      return this._range(prefix)
        .then(text => this._set(prefix, text))
        .then(() => this.map.get(hash))
    } else {
      return this.map.get(hash)
    }
  }

  /**
   * @private
   * range request against pwnd api
   */
  async _range (prefix) {
    const url = URL + prefix
    const res = await fetch(url)
    const text = await res.text()
    if (res.status < 300) {
      return text
    }
    const err = new Error(text)
    err.status = res.status
    throw err
  }

  /**
   * @private
   * set cache with fresh hashes
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
Pwnd.sha1 = async (password) => {
  const buffer = (new TextEncoder()).encode(password)
  const hash = await crypto.subtle.digest('SHA-1', buffer)
  const digest = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  return digest
}

export default Pwnd
