import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import { state } from './view.js';

// Cкачивание XML через AllOrigins
const fetchRss = (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

  return axios.get(proxyUrl)
    .then((response) => response.data.contents);
};

// Парсинг XML, возвращенние { feed, posts }
const parseRss = (xmlStr) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'text/xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('errors.invalidRss');
  }

  const feedTitle = doc.querySelector('channel > title')?.textContent ?? '';
  const feedDescription = doc.querySelector('channel > description')?.textContent ?? '';
  const feedID = uniqueId('feed_');

  const items = doc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    id: uniqueId('feed_'),
    feedID,
    title: item.querySelector('title').textContent,
    link: item.querySelector('link') ? item.querySelector('link').textContent.trim() : '',
    description: item.querySelector('description').textContent,
  }));

  return {
    feed: {
      id: feedID,
      title: feedTitle,
      description: feedDescription,
    },
    posts,
  };
};

// Вызовы функций, обновление стейта
const loadFeed = (url) => fetchRss(url)
  .then((xmlStr) => parseRss(xmlStr))
  .then((data) => {
    state.feeds.push({ ...data.feed, url });
    state.posts.push(...data.posts);
  })
// Отлавливаем сетевые ошибки
  .catch((err) => {
    console.error('CATCH ERROR:', err.message, err);
    state.form.error = err.message === 'errors.invalidRss'
      ? 'errors.invalidRss'
      : 'errors.network';
  });

const checkUpdates = () => {
  const promises = Array.from(state.feeds).map((feed) => {
    const { url } = feed;
    const existingLinks = new Set(state.posts.map((post) => post.link));

    return fetchRss(url)
      .then((xmlStr) => parseRss(xmlStr))
      .then((data) => {
        const fetchedPosts = data.posts;
        const newPosts = fetchedPosts.filter((post) => !existingLinks.has(post.link));
        state.posts.push(...newPosts);
      });
  });

  Promise.all(promises).finally(() => {
    setTimeout(checkUpdates, 5000);
  });
};

export { loadFeed, checkUpdates };
