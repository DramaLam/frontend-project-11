import processStates from './states.js';

const feedback = (state, elements, i18nextInstance) => {
  const { messageContainer } = elements;

  messageContainer.textContent = '';
  messageContainer.classList.remove('show', 'text-danger', 'text-success');

  if (state.processState === processStates.failed) {
    messageContainer.textContent = i18nextInstance.t(`${state.processStateError}`);
    messageContainer.classList.add('text-danger', 'show');
  }

  if (state.processState === processStates.finished) {
    messageContainer.textContent = i18nextInstance.t('messages.app.addRSS');
    messageContainer.classList.add('text-success', 'show');
  }

  if (state.form.processState === processStates.failed) {
    messageContainer.textContent = i18nextInstance.t(`${state.form.processStateError}`);
    messageContainer.classList.add('text-danger', 'show');
  }
};

const createFeedElement = (feed) => {
  const item = document.createElement('li');
  item.classList.add('list-group-item');

  const title = document.createElement('h4');
  title.classList.add('h3');
  title.textContent = feed.title;

  const description = document.createElement('p');
  description.classList.add('mb-0');
  description.textContent = feed.description;

  item.append(title, description);

  return item;
};

const feeds = (state, elements, i18nextInstance) => {
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';

  const header = document.createElement('h3');
  header.textContent = i18nextInstance.t('headlines.feeds');

  const feedList = document.createElement('ul');
  feedList.classList.add('list-group');

  const feedItems = state.feeds.map(createFeedElement);

  feedList.append(...feedItems);
  feedsContainer.append(header, feedList);
};

const form = (state, formElements, i18nextInstance) => {
  const { input, submitButton } = formElements;

  submitButton.textContent = i18nextInstance.t('buttons.addFeed');

  if (state.form.valid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
  }

  if (state.form.processState === processStates.sending) {
    input.readOnly = true;
    submitButton.disabled = true;
  } else {
    input.readOnly = false;
    submitButton.disabled = false;
  }

  if (state.form.processState === processStates.initial) {
    input.focus();
  }

  if (state.form.processState === processStates.finished) {
    input.value = '';
    input.focus();
  }
};

const modal = (state, modalElements, i18nextInstance) => {
  const {
    title,
    body,
    closeButton,
    readMoreLink,
  } = modalElements;

  const currentPost = state.posts.find((post) => post.id === state.uiState.previewPostId);

  title.textContent = currentPost.title;
  body.innerHTML = currentPost.description;
  closeButton.textContent = i18nextInstance.t('buttons.modal.close');
  readMoreLink.textContent = i18nextInstance.t('buttons.modal.readMore');
  readMoreLink.href = currentPost.link;
};

const createPostItem = (post, viewedPosts, i18nextInstance) => {
  const item = document.createElement('li');
  item.classList.add(
    'd-flex',
    'list-group-item',
    'justify-content-between',
    'align-items-start',
  );

  const link = document.createElement('a');

  const linkFontWeights = (viewedPosts.has(post.id))
    ? ['fw-normal']
    : ['fw-bold'];

  link.classList.add(...linkFontWeights);
  link.href = post.link;
  link.textContent = post.title;

  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary', 'btn-sm', 'ms-2');
  button.type = 'button';
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#postPreviewModal';
  button.dataset.postId = post.id;
  button.textContent = i18nextInstance.t('buttons.postPreview');

  item.append(link, button);

  return item;
};

const posts = (state, elements, i18nextInstance) => {
  const { postsContainer } = elements;

  postsContainer.innerHTML = '';

  if (state.posts.length === 0) {
    return;
  }

  const header = document.createElement('h2');
  header.textContent = i18nextInstance.t('headlines.posts');

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group');

  const postItems = state.posts
    .map((post) => createPostItem(post, state.uiState.viewedPostsIds, i18nextInstance));

  postsList.append(...postItems);
  postsContainer.append(header, postsList);
};

export default {
  form,
  feedback,
  feeds,
  posts,
  modal,
};
