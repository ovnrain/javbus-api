const path = require('path')
 
const buildEslintCommand = (filenames) =>
  `next lint --config .eslintrc.commit.json --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`
 
module.exports = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  '*.{css,scss}': 'prettier --write'
}
