/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['main', 'next'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release-plus/docker',
      {
        name: 'parraletz/k8s-manifest-validator'
      }
    ],
    [
      '@semantic-release-plus/docker',
      {
        name: 'occmundial/add-reviewers'
      }
    ],
    '@semantic-release/github',
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'npx rjp package.json version ${nextRelease.version}',
        successCmd: 'echo "Release ${nextRelease.version} published"',
        failCmd: 'echo "Failed to publish release ${nextRelease.version}"'
      }
    ],
    [
      '@semantic-release/git',
      {
        message: 'ci: Release <%= nextRelease.version %> [skip ci]',
        assets: ['package.json']
      }
    ]
  ]
}
