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

      const m = token.match(/^(\w+)__(\w+)$/);
      if(!m)return;
      if(!tokens[m[1]])tokens[m[1]+'_1'] = tokens[m[1]];
      tokens[m[1]] = {};
      tokens[m[1]][m[2]] = tokens[token];
      delete tokens[token];
    });
  }

  //flatten multi-language scroll to single language
  static flattenTokens(original, languageCode, masterLanguage=null){
    const result = Object.assign({}, original.attributes, (masterLanguage ? original.values[masterLanguage] : null), original.values[languageCode]);
    Object.keys(original.items).forEach(key => {
      result[key] = original.items[key].map(it => Object.assign({}, it.attributes, (masterLanguage ? it.values[masterLanguage] : null), it.values[languageCode]))
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

    result.blocks = sortedBlocks.map(block => ({
      tokens:this.flattenTokens(block, languageCode, masterLanguageCode)
    }))

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