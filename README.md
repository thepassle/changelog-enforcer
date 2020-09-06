## Package Json Enforcer
The purpose of this action is to enforce a change to the version in the `package.json`

### Usage
To use, follow the typical GitHub Action `uses` syntax. 

**Requires the common [Checkout Action](https://github.com/marketplace/actions/checkout) as shown below! The enforcement of change is done all using local `git` commands and requires the repository be checked out!**

```yaml
name: package-json-enforcer

on: [pull_request]

jobs:
  package-json-enforcer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: '0'
      - uses: thepassle/changelog-enforcer@0.0.6
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs / Properties

`skipLabel` - default: `Skip-Changelog` 
* the name of a GitHub label that skips execution of the Changelog Enforcer. This is useful for small changes such as configuration that doesn't need to be reflected in the changelog. By using a label, the developer and any reviewer can agree if the change should be reflected in the changelog, and if not can apply a label. The Changelog Enforcer will re-check if the `labeled` and `unlabeled` event types are specified in the workflow.
