const os = require('os');
const path = require('path');

const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { Octokit } = require('@octokit/rest');

/**
 * Get the GitHub platform architecture name
 * @param {string} arch - https://nodejs.org/api/oshtml#os_os_arch
 * @returns {string}
 */
function mapArch(arch) {
  const mappings = {
    x32: '386',
    x64: 'amd64',
  };
  return mappings[arch] || arch;
}

/**
 * Get the GitHub OS name
 * @param {string} osPlatform - https://nodejs.org/api/os.html#os_os_platform
 * @returns {string}
 */
function mapOS(osPlatform) {
  const mappings = {
    win32: 'windows',
  };
  return mappings[osPlatform] || osPlatform;
}

function getOctokit() {
  const options = {};
  const token = core.getInput('github_token');
  if (token) {
    core.debug('Using token authentication for Octokit');
    options.auth = token;
  }

  return new Octokit(options);
}

async function getTerraformDocsVersion(inputVersion) {
  if (!inputVersion || inputVersion == 'latest') {
    core.debug('Requesting for [latest] version ...');
    const octokit = getOctokit();
    const response = await octokit.repos.getLatestRelease({
      owner: 'terraform-docs',
      repo: 'terraform-docs',
    });
    core.debug(`... version resolved to [${response.data.name}]`);
    return response.data.name;
  }

  return inputVersion;
}

async function extractTerraformDocsArchive(archivePath) {
  const platform = os.platform();
  let extPath;

  if (platform.startsWith('win')) {
    extPath = await tc.extractZip(archivePath);
  } else {
    extPath = await tc.extractTar(archivePath);
  }

  return extPath;
}

async function run() {
  try {
    const inputVersion = core.getInput('terraform_docs_version');
    const version = await getTerraformDocsVersion(inputVersion);
    const platform = mapOS(os.platform());
    const arch = mapArch(os.arch());
    const extension = os.platform().startsWith('win') ? 'zip' : 'tar.gz'

    core.debug(`Getting download URL for terraform-docs version ${version}: ${platform} ${arch} ${extension}`);
    const downloadPath = await tc.downloadTool(`https://github.com/terraform-docs/terraform-docs/releases/download/${version}/terraform-docs-${version}-${platform}-${arch}.${extension}`);

    const extPath = await extractTerraformDocsArchive(downloadPath);

    core.addPath(extPath);

    return version;
  } catch (ex) {
    core.error(ex);
    throw ex;
  }
}

module.exports = run;
