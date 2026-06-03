import 'bootstrap/dist/css/bootstrap.min.css';
import { subscribe } from 'valtio/vanilla';
import { state, validate } from './view.js';

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

      // Успех
      state.feeds.push(state.form.url);
      state.form.url = '';
      input.value = '';
      input.focus();

      return Promise.resolve().then(() => {
        input.classList.add('is-valid');
        messageContainer.classList.add('text-success');
        messageContainer.textContent = 'RSS успешно загружен';
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
      messageContainer.textContent = state.form.error;
    }
  });
};

app();
