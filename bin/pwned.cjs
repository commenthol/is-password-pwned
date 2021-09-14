#!/usr/bin/env node

const readline = require('readline')
const { Writable } = require('stream')
const Pwnd = require('..')

async function check (pwd) {
  const pwnd = new Pwnd()
  const num = await pwnd.get(pwd)
  console.log('password found %s times', num || 0)
}

function readLine (arg = {}) {
  const {
    prompt = 'password: ',
    hidden = true
  } = arg
  return new Promise(resolve => {
    const muted = new Writable({ write: (chunk, enc, cb) => { cb() } })
    const rl = readline.createInterface({
      input: process.stdin,
      output: hidden ? muted : process.stdout,
      terminal: true
    })
    hidden && process.stdout.write(prompt)
    rl.question(prompt, (pwd) => {
      process.stdout.write(`\r${new Array(prompt.length).fill(' ').join('')}\r`)
      rl.close()
      resolve(pwd)
    })
  })
}

const [pwd] = process.argv.slice(2)
if (!pwd) {
  readLine().then(pwd => check(pwd))
} else {
  check(pwd)
}
