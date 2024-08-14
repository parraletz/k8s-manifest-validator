import { Octokit } from '@octokit/rest'
import { execSync } from 'child_process'
import * as path from 'path'
import simpleGit from 'simple-git'

const git = simpleGit()

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || process.env.PLUGIN_GITHUB_TOKEN
})

async function getChangeFiles(base: string, head: string): Promise<string[]> {
  const diff = await git.diff(['--name-only', `${base}...${head}`])
  return diff.split('\n').filter(file => file)
}

async function postComment(prNumber: number, commentBody: string) {
  const remoteUrl =
    (process.env.CI_REMOTE_URL as string) ||
    (process.env.DRONE_REPO_LINK as string) ||
    (process.env.PLUGIN_REPO_LINK as string)

  const repoMatch = remoteUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/)

  const owner =
    ((repoMatch && repoMatch[1]) as string) ||
    (process.env.PLUGIN_GITHUB_OWNER as string) ||
    (process.env.PLUGIN_OWNER as string) ||
    (process.env.GITHUB_OWNER as string)

  let repo =
    (repoMatch && repoMatch[2]) ||
    (process.env.PLUGIN_GITHUB_REPO as string) ||
    (process.env.PLUGIN_REPO as string) ||
    (process.env.GITHUB_REPO as string)

  if (repo.endsWith('.git')) {
    repo = repo.slice(0, -4)
  }

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: commentBody
  })
}

function lintFile(filePath: string): boolean {
  try {
    const result = execSync(`kubeconform ${filePath}`).toString()
    console.log(result)
    return true
  } catch (error) {
    console.error(
      `Linting failed for file: ${filePath} with error: ${(error as Error).message}`
    )
    return false
  }
}

async function main() {
  const baseRevision =
    process.env.CI_BASE_REVISION || process.env.GITHUB_BASE_SHA
  const headRevision = process.env.CI_COMMIT_SHA || process.env.GITHUB_SHA
  if (!baseRevision || !headRevision) {
    console.error('Base or head revision not found')
    process.exit(1)
  }

  console.log(`Base revision: ${baseRevision}`)

  const changeFiles = await getChangeFiles(baseRevision, headRevision)

  console.log('Changed files:', changeFiles)

  let lintErrors: string[] = []

  changeFiles.forEach(file => {
    if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      const absolutePath = path.resolve(file)
      console.log(`Linting file: ${absolutePath}`)
      const lintResult = lintFile(absolutePath)
      if (!lintResult) {
        lintErrors.push(file)
      }
    }
  })

  let commentBody = ''
  if (lintErrors.length > 0) {
    const errorEmoji = '❌'
    commentBody += `${errorEmoji} **Linting failed for the following files:**\n`
    lintErrors.forEach(file => {
      commentBody += `- ${file}\n`
    })
  } else {
    const successEmoji = '✅'
    commentBody += `${successEmoji} **Linting passed for all changed files**`
  }

  await postComment(parseInt(process.env.PR_NUMBER as string), commentBody)
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
