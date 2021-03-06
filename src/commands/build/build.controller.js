const _ = require('lodash');
const path = require('path');
const buildHelper = require('./build.helper');
const utils = require('../../utils');
const messages = require('../../messages');

class buildClass {
  async createFunctionsYml() {
    const savedOpts = _.get(this.serverless, 'variables.service.custom.smConfig.build', {});
    const feature = this.options.feature;
    const scope = this.options.scope || savedOpts.scope || 'local';
    const srcPath = `${this.cwd}${path.sep}src`;
    const basePathDuplicate = await utils.checkIfBasePathDuplicate(srcPath);
    let featureFunctions = [];
    if (scope && (scope !== 'local' && scope !== 'global')) {
      utils.log.errorMessage(messages.INVALID_SCOPE);
      throw new Error(messages.INVALID_SCOPE);
    }
    if (basePathDuplicate) {
      utils.log.errorMessage(messages.DUPLICATE_PATH);
      throw new Error(messages.DUPLICATE_PATH);
    }
    if (feature) {
      featureFunctions = [{
        path: `${srcPath}${path.sep}${feature}${path.sep}${feature}-functions.yml`,
        name: feature
      }];
    } else {
      featureFunctions = utils.getFeaturePath(srcPath);
    }
    if (scope === 'local') {
      await buildHelper.localBuild(featureFunctions, feature, this.cwd);
      utils.log.info(`Local '${featureFunctions.map(f => f.name).join()}' feature build successful`);
    } else {
      await buildHelper.globalBuild(featureFunctions, feature, this.cwd);
      utils.log.info(`${feature ? `Global '${feature}' Feature` : 'Global'} build successful`);
    }
  }
}

module.exports = buildClass;
