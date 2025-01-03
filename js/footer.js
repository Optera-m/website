const headerElement = document.querySelector("header");
const footerElement = document.querySelector("footer");

const fetchHeader = async () => {
  try {
    const res = await fetch("/header.txt");
    const template = await res.text();

    headerElement.innerHTML = template;
  } catch (err) {
    console.log(err);
  }
};

const fetchFooter = async () => {
  try {
    const res = await fetch("/footer.txt");
    const template = await res.text();

    footerElement.innerHTML = template;
  } catch (err) {
    console.log(err);
  }
};

function toggleNav() {
  const nav = document.getElementById('navKnop');
  nav.classList.toggle('show');
  const toggler = document.querySelector('.navbar-toggler');
  const isExpanded = toggler.getAttribute('aria-expanded') === 'true';
  toggler.setAttribute('aria-expanded', !isExpanded);
}

fetchHeader();
fetchFooter();
