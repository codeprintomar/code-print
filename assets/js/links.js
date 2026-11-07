/* Links page (links.html) */
document.addEventListener('DOMContentLoaded', async function () {
  if (window.cmsReady) await window.cmsReady;
  var observeReveals = CP.observeReveals;
  var linksContainer = document.getElementById('links-container');
  if (linksContainer && typeof linksData !== 'undefined' && Array.isArray(linksData)) {
    linksData.forEach(function (section) {
      var sectionElement = document.createElement('div');
      sectionElement.className = 'link-section';
      sectionElement.dataset.title = section.title;

      var title = document.createElement('h2');
      title.className = 'link-section-title';
      title.innerHTML = '<span class="emoji"></span>';
      title.querySelector('.emoji').textContent = section.icon || '🔗';
      title.appendChild(document.createTextNode(' ' + section.title));
      sectionElement.appendChild(title);

      section.items.forEach(function (item) {
        var isAvailable = item.available !== false && item.url;
        var card = document.createElement(isAvailable ? 'a' : 'div');
        card.className = 'link-row' + (isAvailable ? '' : ' soon');

        if (isAvailable) {
          card.href = item.url;
          if (item.type === 'download') card.setAttribute('download', '');
          if (item.type === 'external') {
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
          }
        }

        var info = document.createElement('div');
        info.className = 'info';
        var icon = document.createElement('span');
        icon.className = 'emoji';
        icon.textContent = item.icon || '🔗';
        var text = document.createElement('div');
        var name = document.createElement('div');
        name.className = 'name';
        name.textContent = item.name;
        text.appendChild(name);
        if (item.description) {
          var description = document.createElement('div');
          description.className = 'sub';
          description.textContent = item.description;
          text.appendChild(description);
        }
        info.append(icon, text);
        card.appendChild(info);

        if (isAvailable) {
          var arrow = document.createElement('span');
          arrow.className = 'arrow';
          arrow.textContent = item.type === 'download' ? '⬇' : '←';
          card.appendChild(arrow);
        }
        sectionElement.appendChild(card);
      });
      linksContainer.appendChild(sectionElement);
    });

    // Filter tabs for link sections (All / Websites / Apps & Downloads / ...)
    var linkTabsContainer = document.getElementById('link-filter-tabs');
    if (linkTabsContainer) {
      var sectionTitles = linksData.map(function (s) { return s.title; });
      var linkFilters = ['all'].concat(sectionTitles);
      linkFilters.forEach(function (title, i) {
        var btn = document.createElement('button');
        btn.className = 'filter-tab' + (i === 0 ? ' active' : '');
        btn.textContent = title === 'all' ? 'الكل' : title;
        btn.dataset.filter = title;
        btn.addEventListener('click', function () {
          linkTabsContainer.querySelectorAll('.filter-tab').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          linksContainer.querySelectorAll('.link-section').forEach(function (sec) {
            sec.style.display = (title === 'all' || sec.dataset.title === title) ? '' : 'none';
          });
        });
        linkTabsContainer.appendChild(btn);
      });
    }
  }
});
