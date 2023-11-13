const moment = require('moment');

class HelperLabel{
  static formatDateAttribute(original, attributeNames=[], language="en"){
    attributeNames.forEach(name => {
      const date = original.attributes[name];
      if(!date)return;
      original.attributes[name] = this.formatDate(date, language);
    })

    return original
  }

  static formatDate(txtDate, language){
    const locales = new Map([['en', 'en-gb'],['zh-hant', 'zh-hk'], ['zh-hans', 'zh-cn']]);
    return moment(txtDate, 'YYYY-MM-DD', locales.get(language) || language ).format('LL')
  }
}

module.exports = HelperLabel;