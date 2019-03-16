/* globals bianco docsearch */
const { $, addEvent, getAttr } = bianco
const ACTIVE_LINK_CLASS = 'active'

function initSearch() {
  docsearch({
    apiKey: '7bd0a67ac7a1cccd05d0722dba941498',
    indexName: 'riotjs',
    inputSelector: '.doc-search',
    debug: false // Set debug to true if you want to inspect the dropdown
  })
}

function updateSidebarLinks(links) {
  const activeLinks = links.filter(link => getAttr(link, 'href') === window.location.hash)
  const oldActiveLinks = links.filter(link => link.classList.contains(ACTIVE_LINK_CLASS))
  const [lastActiveLink] = activeLinks

  activeLinks.forEach(link => link.classList.add(ACTIVE_LINK_CLASS))
  oldActiveLinks.forEach(link => link.classList.remove(ACTIVE_LINK_CLASS))
}

function syncSidebar(sidebar) {
  const links = $('a[href^="#"]', sidebar)

  addEvent(window, 'hashchange', () => updateSidebarLinks(links))
  updateSidebarLinks(links)
}

const [sidebar] = $('.sidebar')
const [docSearch] = $('.doc-search')

if (sidebar) syncSidebar(sidebar)
if (docSearch) initSearch()