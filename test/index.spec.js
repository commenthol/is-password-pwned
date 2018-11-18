/**
 * @author commenthol
 * @copyright Unlicense
 */

const assert = require('assert')
const { rangeResponse } = require('./fixtures')

const Pwnd = require('..')

describe('Pwnd', function () {
  const pwnd = new Pwnd()

  it('should hash password', function () {
    const digest = Pwnd.sha1('nutella')
    assert.strictEqual(digest, 'B3D60A34B744159793C483B067C56D8AFFC5111A')
  })

  it('should split and set map', function () {
    const pwnd = new Pwnd()
    pwnd._set('B3D60', rangeResponse.text)
  })

  it('should ignore empty text', function () {
    const pwnd = new Pwnd()
    pwnd._set('B3D60')
  })

  it('should get password', async function () {
    this.timeout(5000)
    const num = await pwnd.get('nutella')
    assert.ok(num >= 20833)
  })

  it('should get password again', async function () {
    const num = await pwnd.get('NutellA')
    assert.ok(num >= 20833)
  })

  it('should bail on error', async function () {
    this.timeout(5000)
    const pwnd = new Pwnd()
    const num = await pwnd._range('B3D6O')
      .catch(err => {
        assert.ok(err)
        assert.strictEqual(err.status, 400)
      })
    assert.strictEqual(num, undefined)
  })
})
