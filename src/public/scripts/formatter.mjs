import { marked } from 'marked';

document.querySelectorAll('.markdown-content').forEach(el => {
  el.innerHTML = marked(el.textContent);
});