export function el(
  tag,
  { cls, html, text, attrs = {}, ds = {}, children = [] } = {}
) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html) n.innerHTML = html;
  if (text) n.textContent = text;
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  Object.entries(ds).forEach(([k, v]) => (n.dataset[k] = v));
  children.forEach((c) => n.appendChild(c));
  return n;
}
