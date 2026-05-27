import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js' // ES 2015
dayjs.extend(localizedFormat);

export default class HelperLabel{
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
    return dayjs(txtDate, 'YYYY-MM-DD', locales.get(language) || language ).format('LL')
  }
}