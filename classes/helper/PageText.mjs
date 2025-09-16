import {Central, Controller, ControllerMixinDatabase, ORM} from '@lionrockjs/central';

import DefaultPage from '../model/Page.mjs';
const Page = await ORM.import('Page', DefaultPage);

export default class HelperPageText{
  static defaultOriginal(){
    return {...this.defaultOriginalItem(),"items":{}};
  }

  static defaultOriginalItem(){
    return {"attributes":{},"pointers":{},"values":{}}
  }

  static async resolvePointer(database, original, language, masterLanguage){
    const prints = new Map();

    for(let key in original.pointers){
      const pageId = original.pointers[key];
      if(!pageId) continue;
      let print = prints.get(pageId);
      if(!print){
        try{
          const page = await ORM.factory(Page, pageId, {database, asArray:false});
          const original = HelperPageText.getOriginal(page);

          print = HelperPageText.originalToPrint(original, language, masterLanguage || Central.config.cms.defaultLanguage, false);
          print.tokens.id = page.id;
          print.tokens._slug = page.slug;
          print.tokens._name = page.name;
          prints.set(pageId, print);
        }catch(e){
          original.pointers[key] = "";
          continue;
        }
      }
      original.pointers[key] = print.tokens;
    }

    //loop items
    for(let itemKey in original.items){
      const items = original.items[itemKey];
      for(const item of items){
        if(!item.pointers )continue;

        for(let key in item.pointers){
          const pageId = item.pointers[key];
          if(!pageId) continue;

          let print = prints.get(pageId);
          if(!print){
            const page = await ORM.factory(Page, pageId, {database, asArray:false});
            const original = HelperPageText.getOriginal(page);

            print = HelperPageText.originalToPrint(original, language, masterLanguage || Central.config.cms.defaultLanguage, false);
            print.tokens.id = page.id;
            prints.set(pageId, print);
          }
          item.pointers[key] = print.tokens;
        }
      }
    }

    //loop blocks
    for(let block in original.blocks){
      await this.resolvePointer(database, block, language, masterLanguage);
    }
  }

  static getOriginal(page, attributes={}){
    if(!page.original)return this.defaultOriginal();
    if(typeof page.original === 'object'){
      //page.original is already a object
      return page.original;
    }

    const original = JSON.parse(page.original);
    Object.assign(original.attributes, attributes);

    return original;
  }

  static tokenToObject(tokens){
    Object.keys(tokens).forEach(token => {
      if(Array.isArray(tokens[token])){
        const items = tokens[token];
        items.forEach(it => this.tokenToObject(it));
        return;
      }

      //find nested datatype xxx__yyy to xxx: {yyy:""}
      //if xxx exist, rename to xxx_1
      //keep xxx__yyy
      const m = token.match(/^(\w+)__(\w+)$/);
      if(!m)return;
      if(typeof tokens[m[1]] === 'string'){
        tokens[m[1]+'_1'] = tokens[m[1]];
        tokens[m[1]] = {};
      }
      //append to exist xxx
      tokens[m[1]] = tokens[m[1]] || {};
      tokens[m[1]][m[2]] = tokens[token];
    });
  }

  //flatten multi-language scroll to single language
  static flattenTokens(original, languageCode, masterLanguage=null, sort = true){
    const localeValues = original.values[languageCode] || {};
    //clean up localeValues
    for (const key in localeValues) {
      if(localeValues[key] === ""){
        delete localeValues[key];
      }
    }

    const result = Object.assign({}, original.attributes, original.pointers, (masterLanguage ? original.values[masterLanguage] : null), localeValues);

    Object.keys(original.items).forEach(key => {
      result[key] = original.items[key].map(it => {
        if(!it.values)it.values = {};

        const itemLocaleValues = it.values[languageCode] || {};
        for (const key in itemLocaleValues) {
          if(itemLocaleValues[key] === ""){
            delete itemLocaleValues[key];
          }
        }
        return Object.assign({}, it.attributes, it.pointers, (masterLanguage ? it.values[masterLanguage] : null), itemLocaleValues)
      })
    });

    //collect xxx__yyy to xxx: {yyy:""}
    this.tokenToObject(result);

    if(sort){
      //find items for sorting.
      Object.keys(result).forEach(key => {
        if(Array.isArray(result[key])){
          result[key] = result[key].sort((a, b) => parseInt(a._weight || "0") - parseInt(b._weight || "0"));
        }
      })
    }

    return result;
  }

  //empty value will replace with master language
  static originalToPrint(original, languageCode, masterLanguageCode, sort = true){
    //default print is sorted.
    //if sorting control in view, do not sort.

    const result = {
      tokens : this.flattenTokens(original, languageCode, masterLanguageCode, sort),
      blocks:[],
      tags: {}
    };

    (original.tags || []).forEach(tag => {
      const tagToken = this.flattenTokens(tag, languageCode, masterLanguageCode, sort);

      result.tags[tagToken._type] ||= [];
      result.tags[tagToken._type].push(tagToken);
    })

    if(!original.blocks)return result;

    original.blocks.forEach((block, i) => {
      block.attributes._index = i;
      block.attributes._weight = parseInt(block.attributes._weight || "0");
    });

    //sort blocks by tokens._weight, ascending order
    const blocks = sort ?
      original.blocks.sort((a, b) => a.attributes._weight - b.attributes._weight) : original.blocks;

    //flatten tokens by language
    result.blocks = blocks.map(block => {
      const tokens = this.flattenTokens(block, languageCode, masterLanguageCode, sort);
      return {tokens}
    });

    result.blocks.forEach(block => {
      const blockName = block.tokens._name;
      if(blockName) {
        const tokens = {...block.tokens};
        delete tokens._name;
        delete tokens._weight;
        delete tokens._type;
        const tokenKeys = Object.keys(tokens);
        result.tokens['__'+blockName] = (tokenKeys.length === 0) ? "" : (tokenKeys.length ===1) ? tokens[tokenKeys[0]] : tokens ;
      }
    })

    return result;
  }

  static pageToPrint(page, languageCode, masterLanguageCode = 'en'){
    if(!page)return null;
    if(!page.original)return null;
    const timezone = Central.config.cms.timezone || 'z';

    //check have schedule;
    if(
      (!!page.start && Date.now() < new Date(page.start + timezone).getTime()) ||
      (!!page.end   && Date.now() > new Date(page.end + timezone).getTime())
    ){
      return null;
    }

    const original = HelperPageText.getOriginal(page);
    return this.originalToPrint(original, languageCode, masterLanguageCode);
  }
}