export default {
  input: [
    './src/index.js'
  ],
  output: {
    dir: 'lib',
    format: 'cjs',
    entryFileNames: '[name].cjs',
    exports: 'default',
    preserveModules: false,
    preserveModulesRoot: 'src'
  }
}
