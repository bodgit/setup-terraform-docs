# Setup terraform-docs action

<p align="center">
  <a href="https://github.com/bodgit/setup-terraform-docs/actions"><img alt="setup-terraform-docs status" src="https://github.com/bodgit/setup-terraform-docs/workflows/units-test/badge.svg"></a>
</p>

A GitHub action that installs the [terraform-docs](https://github.com/terraform-docs/terraform-docs) executable in the PATH.

## Inputs

### `terraform_docs_version`

The version of terraform-docs which will be installed.
See [terraform-docs releases page](https://github.com/terraform-docs/terraform-docs/releases) for valid versions.

Default: `"latest"`

### `github_token`

Used to authenticate requests to the GitHub API to obtain release data from the terraform-docs repository.
Authenticating will increase the [API rate limit](https://docs.github.com/en/rest/rate-limit).
Any valid token is supported. No permissions are required.

Default: `${{ github.token }}`

## Outputs

The action does not have any output.

## Usage

```yaml
name: Documentation
on:
  pull_request:

jobs:
  terraform-docs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        name: Checkout source code

      - uses: bodgit/setup-terraform-docs@v1
        name: Setup terraform-docs

      - name: Show version
        run: terraform-docs --version

      - name: Run terraform-docs
        run: terraform-docs markdown . --recursive --output-file README.md --output-mode replace

      - name: Test for documentation changes
        uses: tj-actions/verify-changed-files@v13
        id: updated-docs
        with:
          files: |
            **/README.md

      - name: List changed files
        if: steps.updated-docs.outputs.files_changed == 'true'
        runs: |
          echo "Changed files: ${{ steps.updated-docs.outputs.changed_files }}"
```
