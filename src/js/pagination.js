const newsList = document.querySelector('.news-list');

const pg = document.getElementById('pagination');
const btnNextPg = document.querySelector('button.next-page');
const btnPrevPg = document.querySelector('button.prev-page');

let start = 0;
let end = 7;

const valuePage = {
  curPage: 1, //текущая страница ЭТО ПЕРЕДАВАТЬ ДЛЯ СТАРТА
  numLinksTwoSide: 1, //количество ссылок две стороны от выделенного до ...
  totalPages: 10, // длинна массива данных, или свойство длинны объекта / на 7 и округленное до целого числа
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const news = await fetchUsers();
    console.log(news);
    valuePage.totalPages = Math.ceil(news.results.length / 7);
    renderNewsList(news);
  } catch (error) {
    console.log(error.message);
  }
});

// https://api.nytimes.com/svc/news/v3/content/nyt/world.json?api-key=KAPQs6eCC914vuVn4Z5KoZgqCNfPIWAH

const fetchUsers = async () => {
  const response = await fetch(
    'https://api.nytimes.com/svc/mostpopular/v2/viewed/1.json?api-key=KAPQs6eCC914vuVn4Z5KoZgqCNfPIWAH'
  );
  const news = await response.json();
  return news;
};

function renderNewsList(news) {
  const markup = news.results
    .slice(start, end)
    .map(
      user => `<li class="news-card">
       <p>${user.abstract}</p>
      <a href="${user.url}">Read more</a>
      </li>`
    )
    .join('');
  newsList.innerHTML = markup;
}

// ПАГИНАЦИЯ============================================

pagination();

// ФУНКЦИЯ КЛИК============================================

pg.addEventListener('click', async e => {
  try {
    const news = await fetchUsers();

    console.log(parseInt(e.target.dataset.page, 10));
    if (e.target.dataset.page) {
      const pageNumber = parseInt(e.target.dataset.page, 10);

      valuePage.curPage = pageNumber;
      //вызывается пагинация
      pagination(valuePage);
      console.log(valuePage);

      start = (pageNumber - 1) * 7;
      end = start + 7;

      renderNewsList(news);
      handleButtonLeft();
      handleButtonRight();
    }
  } catch (error) {
    console.log(error.message);
  }
});

// DYNAMIC PAGINATION
function pagination() {
  const { totalPages, curPage, numLinksTwoSide: delta } = valuePage;

  const range = delta + 4; // use for handle visible number of links left side
  // использовать для обработки видимого количества ссылок слева

  let render = '';
  let renderTwoSide = '';
  let dot = `<li class="pg-item"><a class="pg-link">...</a></li>`;
  let countTruncate = 0; // use for ellipsis - truncate left side or right side
  // использовать для многоточия - обрезать левую или правую сторону

  // use for truncate two side
  // используем для усечения двух сторон
  const numberTruncateLeft = curPage - delta; //число Обрезать слева
  const numberTruncateRight = curPage + delta; //число Обрезать слева

  let active = '';
  for (let pos = 1; pos <= totalPages; pos++) {
    active = pos === curPage ? 'active' : '';

    // truncate обрезать
    if (totalPages >= 2 * range - 1) {
      if (numberTruncateLeft > 3 && numberTruncateRight < totalPages - 3 + 1) {
        // truncate 2 side
        if (pos >= numberTruncateLeft && pos <= numberTruncateRight) {
          renderTwoSide += renderPage(pos, active);
        }
      } else {
        // truncate left side or right side
        //обрезать левую или правую сторону
        if (
          (curPage < range && pos <= range) ||
          (curPage > totalPages - range && pos >= totalPages - range + 1) ||
          pos === totalPages ||
          pos === 1
        ) {
          render += renderPage(pos, active);
        } else {
          countTruncate++;
          if (countTruncate === 1) render += dot;
        }
      }
    } else {
      // not truncate
      render += renderPage(pos, active);
    }
  }

  if (renderTwoSide) {
    renderTwoSide =
      renderPage(1) + dot + renderTwoSide + dot + renderPage(totalPages);
    pg.innerHTML = renderTwoSide;
  } else {
    pg.innerHTML = render;
  }
}

// ФУНЦКИЯ РЕНДЕРА ССЫЛКИ===================
function renderPage(index, active = '') {
  return ` <li class="pg-item ${active}" data-page="${index}">
        <a class="pg-link" href="#">${index}</a>
    </li>`;
}

// ФУНКЦИЯ КЛИК============================================
//АКТИВНОСТЬ И НЕАКТИВНОСТЬ КНОПОК

document
  .querySelector('.page-container')
  .addEventListener('click', function (e) {
    handleButton(e.target);
  });

function handleButton(element) {
  if (element.classList.contains('prev-page')) {
    valuePage.curPage--;

    handleButtonLeft();
    btnNextPg.disabled = false;
  } else if (element.classList.contains('next-page')) {
    valuePage.curPage++;
    handleButtonRight();
    btnPrevPg.disabled = false;
  }
  pagination();
}

//дисаблед на лево
function handleButtonLeft() {
  if (valuePage.curPage === 1) {
    btnPrevPg.disabled = true;
  } else {
    btnPrevPg.disabled = false;
  }
}

//дисаблед на право
function handleButtonRight() {
  if (valuePage.curPage === valuePage.totalPages) {
    console.log(valuePage.curPage);
    btnNextPg.disabled = true;
  } else {
    btnNextPg.disabled = false;
  }
}
