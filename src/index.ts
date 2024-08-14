import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'
import yaml from 'js-yaml'

export async function run() {
  try {
    const token = core.getInput('repo-token', { required: true })

    const reviewersFilePath = core.getInput('reviewers-file-path')

    const fileContent = fs.readFileSync(reviewersFilePath, 'utf8')
    const reviewersData = yaml.load(fileContent) as { reviewers: string[] }

    const reviewers = reviewersData.reviewers

    const octokit = github.getOctokit(token)

    const context = github.context
    const { owner, repo } = context.repo

    if (context.payload.pull_request) {
      const pull_number = context.payload.pull_request.number

      await octokit.rest.pulls.requestReviewers({
        owner,
        repo,
        pull_number,
        reviewers
      })
      core.info(
        `Requested reviewers: ${reviewers.join(', ')} added to PR #${pull_number}`
      )
    } else {
      core.setFailed('No pull request found.')
    }
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()
