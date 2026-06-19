import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'bootstrap';
import { subscribe } from 'valtio/vanilla';
import {
  state, validate, i18n, initPromise,
} from './view.js';
import { loadFeed, checkUpdates } from './rss.js';

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
      return loadFeed(url).then(() => {
        if (state.form.error) return null;

        state.form.url = '';
        input.value = '';
        input.focus();

        return Promise.resolve().then(() => {
          input.classList.add('is-valid');
          messageContainer.classList.add('text-success');
          messageContainer.textContent = i18n.t('success.loaded');
          if (state.feeds.length === 1) {
            checkUpdates();
          }
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

  subscribe(state.feeds, () => {
    const containerFeeds = document.querySelector('div[data-type="feeds"]');
    let ul = containerFeeds.querySelector('ul');

    if (!ul) {
      ul = document.createElement('ul');
      ul.classList.add('list-group', 'border-0', 'rounded-0');
      containerFeeds.append(ul);
    }

    ul.innerHTML = '';

    state.feeds.forEach((feed) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0');
      const feedTitle = document.createElement('h6');
      feedTitle.classList.add('m-0');
      feedTitle.textContent = feed.title;
      const feedDescription = document.createElement('p');
      feedDescription.classList.add('m-0', 'small', 'text-black-50');
      feedDescription.textContent = feed.description;

      li.append(feedTitle, feedDescription);

      ul.append(li);
    });
  });

  const modal = new Modal(document.getElementById('postModal'));

  subscribe(state.posts, () => {
    const containerPosts = document.querySelector('div[data-type="posts"]');
    let ul = containerPosts.querySelector('ul');

    if (!ul) {
      ul = document.createElement('ul');
      ul.classList.add('list-group', 'border-0', 'rounded-0');
      containerPosts.append(ul);
    }

    ul.innerHTML = '';

    state.posts.forEach((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0');
      const postLink = document.createElement('a');
      postLink.textContent = post.title;
      postLink.setAttribute('href', post.link);
      postLink.setAttribute('target', '_blank');
      
      state.readPostIds.includes(post.id) ?
        postLink.classList.add('fw-normal') :
        postLink.classList.add('fw-bold');

      const btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'flex-shrink-0', 'ms-2');
      btn.dataset.postId = post.id;
      btn.textContent = 'Просмотр';

      btn.addEventListener('click', () => {
        const clickedPost = state.posts.find((p) => p.id === post.id)

        const elLink = document.getElementById('postModalLink');
        const elTitle = document.getElementById('postModalTitle');
        const elDisc = document.getElementById('postModalBody');
        elDisc.innerHTML = '';
        const p = document.createElement('p');
        elDisc.append(p);


        elTitle.textContent = clickedPost.title;
        p.textContent = clickedPost.description;
        elLink.setAttribute('href', clickedPost.link);

        state.readPostIds.push(clickedPost.id);
        postLink.classList.remove('fw-bold');
        postLink.classList.add('fw-normal');

        modal.show();
      });

      li.append(postLink, btn);
      ul.append(li);
    });
  });
};

initPromise.then(() => { app(i18n); });
