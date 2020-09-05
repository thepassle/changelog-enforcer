const packageJson = require('./src/package-json-enforcer')

// Looks for a label with the name from
async function run() {
  packageJson.enforce();
}

run()
