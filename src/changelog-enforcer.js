const core = require('@actions/core')
const github = require('@actions/github')
const exec = require('@actions/exec')

module.exports.enforce = async function() {
    try {
        const skipLabel = core.getInput('skipLabel')
        core.info(`Skip Label: ${skipLabel}`)

        const pullRequest = github.context.payload.pull_request
        const labelNames = pullRequest.labels.map(l => l.name)
        const headRef = pullRequest.head.ref

        if (!labelNames.includes(skipLabel)) {
            let masterPackageJson = ''
            const options = {}
            options.listeners = {
                stdout: (data) => {
                    masterPackageJson += data.toString();
                }
            }

            await exec.exec('git', ['show', `master:package.json`], options)
            const masterVersion = JSON.parse(masterPackageJson).version;

            let curPackageJson = ''
            const options2 = {}
            options2.listeners = {
                stdout: (data) => {
                    curPackageJson += data.toString();
                }
            }

            await exec.exec('git', ['show', `${headRef}:package.json`], options2)
            const curVersion = JSON.parse(curPackageJson).version;

            if(masterVersion === curVersion) {
                throw new Error('No update to package.json version!');
            }
        }
    } catch(error) {
        core.setFailed(error.message);
    }
};
