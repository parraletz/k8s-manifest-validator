import { Octokit } from '@octokit/rest'
import * as fs from 'fs'
import yaml from 'js-yaml'

const prNumber = process.env.PR_NUMBER || process.env.PLUGIN_PR_NUMBER
const reviewersFilePath =
  (process.env.REVIEWERS_FILE_PATH as string) ||
  (process.env.PLUGIN_REVIEWERS_FILE_PATH as string)
const fileContent = fs.readFileSync(reviewersFilePath, 'utf8')

const reviewersData = yaml.load(fileContent) as { reviewers: string[] }
let reviewers = reviewersData.reviewers

console.log('Reviewers:', reviewers)

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || process.env.PLUGIN_GITHUB_TOKEN
})

const remoteUrl =
  (process.env.CI_REMOTE_URL as string) ||
  (process.env.DRONE_REPO_LINK as string) ||
  (process.env.PLUGIN_REPO_LINK as string)

const repoMatch = remoteUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/)

const owner =
  (repoMatch && repoMatch[1]) ||
  process.env.PLUGIN_GITHUB_OWNER ||
  process.env.GITHUB_OWNER
const repo =
  (repoMatch && repoMatch[2]) ||
  process.env.PLUGIN_GITHUB_REPO ||
  process.env.GITHUB_REPO

const commitAuthor = process.env.CI_COMMIT_AUTHOR
if (commitAuthor) {
  reviewers = reviewers.filter(reviewer => reviewer !== commitAuthor)
  console.log('Filtered Reviewers:', reviewers)
}

async function addReviewers() {
  try {
    if (!prNumber) {
      throw new Error('PR_NUMBER is not defined')
    } else if (!reviewers) {
      throw new Error('REVIEWERS is not defined')
    } else if (!owner) {
      throw new Error('OWNER is not defined')
    } else if (!repo) {
      throw new Error('REPO is not defined')
    } else {
      const response = await octokit.pulls.requestReviewers({
        owner,
        repo,
        pull_number: +prNumber,
        reviewers
      })
      console.log('Code reviewers added:', response.data)
    }
  } catch (error) {
    console.error('Error to added code reviewers:', error)
  }
}

addReviewers()
