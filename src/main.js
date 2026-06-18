import 'bootstrap/dist/css/bootstrap.min.css';
import { subscribe } from 'valtio/vanilla';
import {
  state, validate, i18n, initPromise,
} from './view.js';
import runRss from './rss.js';

const updateFeeds = () => {
  const containerFeeds = document.querySelector('div[data-type="feeds"]');
  let ul = containerFeeds.querySelector('ul');

  if (!ul) {
    ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    containerFeeds.append(ul);
  }

  const feedLi = document.createElement('li');
  feedLi.classList.add('list-group-item', 'border-0');
  const lastFeed = state.feeds[state.feeds.length - 1];
  const feedTitle = document.createElement('h6');
  feedTitle.classList.add('m-0');
  feedTitle.textContent = lastFeed.title;
  const feedDescription = document.createElement('p');
  feedDescription.classList.add('m-0', 'small', 'text-black-50');
  feedDescription.textContent = lastFeed.description;

  feedLi.append(feedTitle, feedDescription);

  ul.append(feedLi);
};

const updatePosts = () => {
  const containerPosts = document.querySelector('div[data-type="posts"]');
  let ul = containerPosts.querySelector('ul');

  if (!ul) {
    ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    containerPosts.append(ul);
  }

  const lastFeed = state.feeds[state.feeds.length - 1];
  const newPosts = state.posts.filter((post) => post.feedID === lastFeed.id);

  newPosts.forEach((post) => {
    const postLi = document.createElement('li');
    postLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0');
    const postLink = document.createElement('a');
    postLink.textContent = post.title;
    postLink.setAttribute('href', post.link);
    postLink.setAttribute('target', '_blank');

    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'flex-shrink-0', 'ms-2');
    btn.textContent = 'Просмотр';

    postLi.append(postLink, btn);
    ul.append(postLi);
  });
};

const app = () => {
  const input = document.querySelector('.form-control');
  const form = document.querySelector('.rss-form');
  const messageContainer = document.querySelector('#messageContainer');

  if (!input) return;

  // Отправка формы
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.url = input.value;

    // Ждём микротаск — валидация уже отработала в subscribe
    validate(state.form.url).then((isValid) => {
      if (!isValid) return null;

      const { url } = state.form;

      // Успех
      return runRss(url).then(() => {
        if (state.form.error) return null;
        updateFeeds();
        updatePosts();

        state.form.url = '';
        input.value = '';
        input.focus();

        return Promise.resolve().then(() => {
          input.classList.add('is-valid');
          messageContainer.classList.add('text-success');
          messageContainer.textContent = i18n.t('success.loaded');
        });
      });
    });
  });

  // Изменение рамки ввода, вывод ошибок
  subscribe(state.form, () => {
    input.classList.remove('is-invalid', 'is-valid');
    messageContainer.classList.remove('text-danger', 'text-success');
    messageContainer.textContent = '';

    if (state.form.error) {
      input.classList.add('is-invalid');
      messageContainer.classList.add('text-danger');
      messageContainer.textContent = i18n.t(state.form.error);
    }
  });
};

initPromise.then(() => { app(i18n); });
