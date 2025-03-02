import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function createEnvFile () {
	const envPath = path.join(__dirname, '.env')
	if (fs.existsSync(envPath)) {
    console.log('.env file already exists. Skipping creation.')
    return
  }

  const examplePath = path.join(__dirname, '.env.example')
  const exampleContent = fs.readFileSync(examplePath, 'utf8')

  const questions = exampleContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => {
    const [key] = line.split('=')
    return {
      type: 'input',
      name: key,
      message: `${key}:`
    }
  })

  const responses = await inquirer.prompt(questions)
  const envContent = Object.entries(responses).map(([key, value]) => `${key}=${value}`).join('\n')
  fs.writeFileSync('.env', envContent)
}

function createDummyContent () {
  dotenv.config()

  const logsPath = process.env.LOGS_PATH || '.logs'
  const fileLog = process.env.FILE_LOG || 'output.log'
  const fileStatus = process.env.FILE_STATUS || 'status.log'
	const statusList = process.env.STATUS_LIST.split(',') || ['success']

  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath)
  }

	console.log(typeof statusList)
  statusList.forEach(status => {
    const folderPath = path.join(__dirname, logsPath, `test-folder-${status}`)
    fs.mkdirSync(folderPath)
    fs.writeFileSync(path.join(folderPath, fileLog), 'Fake log content')
    fs.writeFileSync(path.join(folderPath, fileStatus), status)
  })
}

async function setup () {
  await createEnvFile()
  createDummyContent()
  console.log('Setup completed.')
}

setup()
