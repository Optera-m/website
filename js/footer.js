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
function reloadCss()
{
    var links = document.getElementsByTagName("link");
    for (var cl in links)
    {
        var link = links[cl];
        if (link.rel === "stylesheet")
            link.href += "";
    }
}

fetchHeader();
fetchFooter();
reloadCss();
