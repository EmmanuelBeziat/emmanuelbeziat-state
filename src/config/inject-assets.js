import fs from 'fs'
import path from 'path'
import { config } from './index.js'

const templatePath = path.join(config.paths.views, 'layout/index.njk')

// Read the Nunjucks template
let templateContent = fs.readFileSync(templatePath, 'utf-8')

// Define the new paths for the script and style files
const newScript = '<script src="/assets/scripts/main.js"></script>'
const newStyle = '<link rel="stylesheet" href="/assets/styles/main.css">'

// Replace existing <script> and <link> tags
templateContent = templateContent
	.replace(/<script.*<\/script>/, newScript)
	.replace(/<link.*>/, newStyle)

// Write the updated content back to the file
fs.writeFileSync(templatePath, templateContent)

console.log(`Assets injected into ${templatePath}`)
