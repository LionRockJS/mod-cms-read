require('kohanajs').addNodeModule(__dirname);
const ControllerContent = require('./classes/controller/Content');
const ControllerMixinContent = require('./classes/controller-mixin/Content');
const HelperLabel = require('./classes/helper/Label');
const HelperPageText = require('./classes/helper/PageText');

module.exports = {
  ControllerContent,
  ControllerMixinContent,
  HelperLabel,
  HelperPageText,
};
