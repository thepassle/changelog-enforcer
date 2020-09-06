const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');

module.exports.enforce = async function () {
  try {
    const skipLabel = core.getInput('skipLabel')
    core.info(`Skip Label: ${skipLabel}`)

    const pullRequest = github.context.payload.pull_request;
    const labelNames = pullRequest.labels.map(l => l.name);
    const baseRef = pullRequest.base.ref;

    if (!labelNames.includes(skipLabel)) {
      const masterVersion = await execute('git', ['show', `origin/master:package.json`], getVersion);
      const curVersion = await execute('cat', ['package.json'], getVersion);
      const changelogUpdated = await execute('git', ['diff', `origin/${baseRef}`, '--name-status', '--diff-filter=AM'], checkChangelog);

      const postComment = createPoster();

      if(!changelogUpdated && masterVersion === curVersion) {
        postComment('Please update the `CHANGELOG.md` and bump the version in the `package.json`.');
        throw new Error('Changelog and package.json version not updated!');
      }

      if(!changelogUpdated) {
        postComment('Please update the `CHANGELOG.md`.');
        throw new Error('Changelog not updated!');
      }

      if(masterVersion === curVersion) {
        postComment('Please update the version in the `package.json`.');
        throw new Error('No update to package.json version!');
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};

function createPoster() {
  const githubToken = core.getInput('GITHUB_TOKEN');
  const pullRequestNumber = github.context.payload.pull_request.number;
  const octokit = new github.GitHub(githubToken);

  return function postComment(msg) {
    octokit.issues.createComment({
      ...github.context.repo,
      issue_number: pullRequestNumber,
      body: msg,
    });
  }
}

function checkChangelog(result) {
  const fileNames = generateUpdatedFileList(result);
  if (!fileNames.includes('CHANGELOG.md')) {
    return false;
  }
  return true;
}

function getVersion(result) {
  return JSON.parse(result).version;
}

async function execute(command, flags, cb) {
  let result = ''
  const options = {}
  options.listeners = {
    stdout: (data) => {
      result += data.toString();
    }
  }

  await exec.exec(command, flags, options);
  return cb(result);
}

function generateUpdatedFileList(output) {
  const changes = output.split(/\r?\n/);
  let fileNames = [];
  changes.map(change => {
      const fileName = change.replace(/(^[A-Z])(\s*)(.*)(\n)?$/g, '$3');
      fileNames.push(fileName);
  });
  return fileNames;
}