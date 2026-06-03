import * as yup from 'yup';
import { proxy } from 'valtio/vanilla';

export const state = proxy({
  form: {
    url: '',
    error: null,
    valid: false,
  },
  feeds: [],
});

const schema = yup.object({
  url: yup
    .string()
    .required('Не должно быть пустым')
    .url('Ссылка должна быть валидным URL')
    .test('unique', 'RSS уже существует', (value) => !state.feeds.includes(value)),
});

export const validate = (url) => {
  if (url === '') {
    state.form.valid = false;
    state.form.error = null;
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
