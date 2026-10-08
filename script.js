const favorites = new Set(JSON.parse(localStorage.getItem('cao-favorites') || '[]'));

const { works, records, topics, timeline, study, references } = window.CAO_DATA;

const worksList = document.getElementById('works-list');
const filtersContainer = document.getElementById('work-filters');
const recordsList = document.getElementById('records-list');
const timelineSlider = document.getElementById('timeline-slider');
const timelineEvent = document.getElementById('timeline-event');
const topicsList = document.getElementById('topics-list');
const studyPanel = document.getElementById('study-panel');
const refList = document.getElementById('reference-list');
const favoritesList = document.getElementById('favorites-list');
const statWorks = document.getElementById('stat-works');
const statRecords = document.getElementById('stat-records');
const statTopics = document.getElementById('stat-topics');
const statSources = document.getElementById('stat-sources');

const filterLabels = ['全部', '曹丕', '曹植', '诗歌', '乐府', '论文'];

function saveFavorites() {
  localStorage.setItem('cao-favorites', JSON.stringify([...favorites]));
}

function renderStats() {
  statWorks.textContent = works.length;
  statRecords.textContent = records.length;
  statTopics.textContent = topics.length;
  statSources.textContent = references.length;
}

function renderFilters() {
  filtersContainer.innerHTML = filterLabels
    .map((label, index) => {
      const isActive = index === 0;
      return `<button class="filter-btn ${isActive ? 'active' : ''}" data-filter="${label}">${label}</button>`;
    })
    .join('');

  const buttons = [...document.querySelectorAll('.filter-btn')];
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      buttons.forEach((btn) => btn.classList.toggle('active', btn === button));
      renderWorks(filter);
    });
  });
}

function renderWorks(filter = '全部') {
  let filtered = works;

  if (filter === '曹丕') filtered = works.filter((item) => item.author === '曹丕');
  if (filter === '曹植') filtered = works.filter((item) => item.author === '曹植');
  if (filter === '诗歌') filtered = works.filter((item) => item.category === '诗歌');
  if (filter === '乐府') filtered = works.filter((item) => item.category === '乐府');
  if (filter === '论文') filtered = works.filter((item) => item.category === '论文');

  worksList.innerHTML = filtered
    .map(
      (work) => `
        <article class="work-card">
          <div class="card-top">
            <span class="author-tag">${work.author}</span>
            <button class="favorite-btn ${favorites.has(work.id) ? 'is-active' : ''}" data-id="${work.id}">
              ${favorites.has(work.id) ? '已收藏' : '收藏'}
            </button>
          </div>
          <h3>${work.title}</h3>
          <div class="meta-line">
            <span>${work.category}</span>
            ${work.tags.map((tag) => `<span>${tag}</span>`).join('')}
          </div>
          <div class="original-block">
            <span class="block-label">古文原文</span>
            <div class="original-text">${work.original}</div>
          </div>
          <div class="translation-block">
            <span class="block-label">现代汉语释义</span>
            <div class="translation-text">${work.translation}</div>
          </div>
          <div class="commentary-block">
            <span class="block-label">解读</span>
            <div class="commentary-text">${work.commentary}</div>
          </div>
          <div class="sources-block">
            <span class="block-label">出处与参考</span>
            <ul class="sources-list">
              ${work.sources.map((src) => `<li>${src}</li>`).join('')}
            </ul>
          </div>
        </article>
      `
    )
    .join('');

  document.querySelectorAll('.favorite-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (favorites.has(id)) {
        favorites.delete(id);
      } else {
        favorites.add(id);
      }
      saveFavorites();
      renderFavorites();
      renderWorks(document.querySelector('.filter-btn.active')?.dataset.filter || '全部');
    });
  });
}

function renderRecords() {
  recordsList.innerHTML = records
    .map(
      (record) => `
        <article class="record-card">
          <span class="source-name">${record.source}</span>
          <h3>${record.title}</h3>
          <p>${record.text}</p>
          <div>
            <span class="block-label">评述</span>
            <p>${record.commentary}</p>
          </div>
        </article>
      `
    )
    .join('');
}

function renderTimeline() {
  const index = Number(timelineSlider.value) || 0;
  const item = timeline[Math.min(index, timeline.length - 1)];
  timelineEvent.innerHTML = `
    <span class="event-year">${item.year}</span>
    <h3>${item.title}</h3>
    <p>${item.summary}</p>
  `;
}

function renderTopics() {
  topicsList.innerHTML = topics
    .map(
      (topic) => `
        <article class="topic-card">
          <h3>${topic.title}</h3>
          <p>${topic.summary}</p>
          <ul class="topic-list">
            ${topic.notes.map((note) => `<li>${note}</li>`).join('')}
          </ul>
        </article>
      `
    )
    .join('');
}

function renderStudy(tab = 'zh') {
  const current = study[tab];
  studyPanel.innerHTML = `
    <h3>${current.title}</h3>
    <p>${current.content}</p>
  `;
}

function renderReferences() {
  refList.innerHTML = references
    .map(
      (item) => `
        <article class="ref-item">
          <span class="source-name">参考文献</span>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </article>
      `
    )
    .join('');
}

function renderFavorites() {
  const favoriteWorks = works.filter((item) => favorites.has(item.id));

  if (!favoriteWorks.length) {
    favoritesList.innerHTML = '<li><span>暂无收藏</span></li>';
    return;
  }

  favoritesList.innerHTML = favoriteWorks
    .map(
      (item) => `
        <li>
          <span>${item.title}</span>
          <button data-remove="${item.id}">删除</button>
        </li>
      `
    )
    .join('');

  favoritesList.querySelectorAll('button[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      favorites.delete(btn.dataset.remove);
      saveFavorites();
      renderFavorites();
      renderWorks(document.querySelector('.filter-btn.active')?.dataset.filter || '全部');
    });
  });
}

function bindStudyTabs() {
  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.toggle('active', btn === button));
      renderStudy(button.dataset.tab);
    });
  });
}

document.getElementById('clear-favorites').addEventListener('click', () => {
  favorites.clear();
  saveFavorites();
  renderFavorites();
  renderWorks(document.querySelector('.filter-btn.active')?.dataset.filter || '全部');
});

timelineSlider.addEventListener('input', renderTimeline);

renderStats();
renderFilters();
renderWorks();
renderRecords();
renderTimeline();
renderTopics();
renderStudy();
renderReferences();
renderFavorites();
bindStudyTabs();
