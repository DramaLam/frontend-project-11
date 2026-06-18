import i18next from 'i18next';
import * as yup from 'yup';
import { proxy } from 'valtio/vanilla';
import resources from './locales/index.js';

export const state = proxy({
  form: {
    url: '',
    error: null,
    valid: false,
  },
  feeds: [],
  posts: [],
});

export const i18n = i18next.createInstance();

export const initPromise = i18n.init({ lng: 'ru', resources });

yup.setLocale({
  mixed: {
    required: 'errors.notEmpty',
  },
  string: {
    url: 'errors.url',
  },
});

const schema = yup.object({
  url: yup
    .string()
    .required()
    .url()
    .test('unique', 'errors.duplicate', (value) => !state.feeds.some((feed) => feed.url === value)),
});

export const validate = (url) => {
  if (url === '') {
    state.form.valid = false;
    state.form.error = 'errors.notEmpty';
    return Promise.resolve(false);
  }

  return schema
    .validate({ url }, { abortEarly: false })
    .then(() => {
      state.form.valid = true;
      state.form.error = null;
      return true;
    })
    .catch((err) => {
      state.form.valid = false;
      const [firstError] = err.errors;
      state.form.error = firstError;
      return false;
    });
};
