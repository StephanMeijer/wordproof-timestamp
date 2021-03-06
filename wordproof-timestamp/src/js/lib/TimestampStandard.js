export default function getJSON(schema, type = null) {
  let object = {};
  switch(type) {
    case 'ArticleTimestamp':
    case 'WebArticleTimestamp':
      object.type = schema['@context']['@type'];
      object.version = schema['@context']['@version'];
      object.title = schema.title;
      object.content = schema.content;
      object.date = schema.date;
      object = checkAttribute(object, schema, 'author');
      object = checkAttribute(object, schema, 'previousVersion');
      object = checkAttribute(object, schema, 'url');
      break;
    case 'ProductTimestamp':
      object.type = schema['@context']['@type'];
      object.version = schema['@context']['@version'];
      object.name = schema.name;
      object.description = schema.description;
      object.date = schema.date;
      object = checkAttribute(object, schema, 'productId');
      object = checkAttribute(object, schema, 'image');
      object = checkAttribute(object, schema, 'previousVersion');
      object = checkAttribute(object, schema, 'price');
      object = checkAttribute(object, schema, 'url');
      break;
    case 'MediaObjectTimestamp':
      object.type = schema['@context']['@type'];
      object.version = schema['@context']['@version'];
      object.title = schema.title;
      object.contentHash = schema.contentHash;
      object.contentUrl = schema.contentUrl;
      object.encodingFormat = schema.encodingFormat;
      object.date = schema.date;
      break;
    default:
      object.title = schema.title;
      object.content = schema.content;
      object.date = schema.date;
      break;
  }
  return object;
}

function checkAttribute(object, schema, attribute) {
  if (schema[attribute]) {
    object[attribute] = schema[attribute];
  }
  return object
}
