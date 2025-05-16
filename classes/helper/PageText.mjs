export default class HelperPageText{
  static getSource(page, attributes={}){
    if(!page.original){
      return {"attributes":{}, "values":{}, "items":{}}
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
  static flattenTokens(original, languageCode, masterLanguage=null){
    const localeValues = original.values[languageCode] || {};
    //clean up localeValues
    for (const key in localeValues) {
      if(localeValues[key] === ""){
        delete localeValues[key];
      }
    }

    const result = Object.assign({}, original.attributes, (masterLanguage ? original.values[masterLanguage] : null), localeValues);
    Object.keys(original.items).forEach(key => {
      result[key] = original.items[key].map(it => {
        const itemLocaleValues = it.values[languageCode] || {};
        for (const key in itemLocaleValues) {
          if(itemLocaleValues[key] === ""){
            delete itemLocaleValues[key];
          }
        }
        return Object.assign({}, it.attributes, (masterLanguage ? it.values[masterLanguage] : null), itemLocaleValues)
      })
    });
    //collect xxx__yyy to xxx: {yyy:""}
    this.tokenToObject(result);
    return result;
  }

  //empty value will replace with master language
  static sourceToPrint(original, languageCode, masterLanguageCode){
    const result = {
      tokens : this.flattenTokens(original, languageCode, masterLanguageCode),
      blocks:[],
      tags: {}
    };

    (original.tags || []).forEach(tag => {
      const tagToken = this.flattenTokens(tag, languageCode, masterLanguageCode);

      result.tags[tagToken._type] ||= [];
      result.tags[tagToken._type].push(tagToken);
    })

    if(!original.blocks)return result;

    //sort blocks by tokens._weight, ascending order
    const sortedBlocks = original.blocks.sort((a, b) => parseInt(a.attributes._weight) - parseInt(b.attributes._weight));

    //flatten tokens by language
    result.blocks = sortedBlocks.map(block => {
      const tokens = this.flattenTokens(block, languageCode, masterLanguageCode);
      //find block items for sorting.
      Object.keys(tokens).forEach(key => {
        if(Array.isArray(tokens[key])){
          tokens[key] = tokens[key].sort((a, b) => parseInt(a._weight || "0") - parseInt(b._weight || "0"));
        }
      })
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

    //check have schedule;
    if(
      (!!page.start && Date.now() < new Date(page.start+'Z').getTime()) ||
      (!!page.end   && Date.now() > new Date(page.end+'Z').getTime())
    ){
      return null;
    }

    return this.sourceToPrint(JSON.parse(page.original), languageCode, masterLanguageCode);
  }
}