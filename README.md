# GitHub Action: Request Reviewers

This GitHub Action automatically requests reviewers for a pull request based on a specified YAML file.

## Prerequisites

- Node.js
- GitHub repository with a pull request

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

## Usage

1. Create a `.github/workflows/request-reviewers.yml` file in your repository with the following content:
    ```yaml
    name: Request Reviewers

    on:
      pull_request:
        types: [opened]

    jobs:
      request-reviewers:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v2
          - name: Request Reviewers
            uses: ./
            with:
              repo-token: \${{ secrets.GITHUB_TOKEN }}
              reviewers-file-path: 'path/to/reviewers.yml'
    ```

2. Create a `reviewers.yml` file in your repository with the following content:
    ```yaml
    reviewers:
      - reviewer1
      - reviewer2
      - reviewer3
    ```

3. Push the changes to your repository:
    ```sh
    git add .github/workflows/request-reviewers.yml reviewers.yml
    git commit -m "Add GitHub Action to request reviewers"
    git push origin main
    ```

## Example

When a pull request is opened, this action will read the `reviewers.yml` file and request the specified reviewers for the pull request.

## License

This project is licensed under the MIT License.