export default (string) => {
  const parser = new DOMParser();
  const xmlString = parser.parseFromString(string, 'application/xml');

  const parserError = xmlString.querySelector('parsererror');

  if (parserError) {
    const error = new Error(parserError.textContent);
    error.isParseError = true;
    throw error;
  }

  const title = xmlString.querySelector('title');
  const description = xmlString.querySelector('description');

  const itemsElements = xmlString.querySelectorAll('item');

  const items = [...itemsElements].map((item) => {
    const itemTitle = item.querySelector('title');
    const itemDescription = item.querySelector('description');
    const itemLink = item.querySelector('link');

    return {
      title: itemTitle.textContent,
      link: itemLink.textContent,
      description: itemDescription.textContent,
    };
  });

  return {
    title: title.textContent,
    description: description.textContent,
    items,
  };
};
