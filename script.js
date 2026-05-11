// ========================================
// 漂流本画展 - JavaScript (Disqus 评论版)
// ========================================

// ---------- Disqus 配置 ----------
const DISQUS_SHORTNAME = 'xyplb-1';
const DISQUS_API_KEY = 'E8zGUSm5GXl19Cv7YTEZec6xGR362vq3dfMcnASWIg2D2z7fwSRqZxQFmVoch5ka';
const SITE_BASE_URL = 'https://xiaoyu1afa8.github.io/portfolio/';

// ---------- 画作数据 ----------
const artworks = [
    { id: 1, image: 'images/art-1.png', title: '实验', author: '漂流本' },
    { id: 2, image: 'images/art-2.jpeg', title: '实验', author: '漂流本' },
    { id: 3, image: 'images/art-3.jpeg', title: '实验', author: '漂流本' },
    { id: 4, image: 'images/art-4.jpeg', title: '实验', author: '漂流本' },
    { id: 5, image: 'images/art-5.png', title: '实验', author: '漂流本' }
];

// ---------- 初始化 ----------
document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
    initNavbar();
    initLightbox();
    initBackTop();
    updateStats();
    loadDisqusCommentCounts();
});

// ---------- 渲染画廊 ----------
function renderGallery() {
    const masonry = document.getElementById('masonry');
    if (!masonry) return;
    masonry.innerHTML = '';

    artworks.forEach(art => {
        const card = document.createElement('div');
        card.className = 'art-card';
        card.setAttribute('data-id', art.id);

        card.innerHTML = `
            <div class="art-image-wrap">
                <img class="art-image" src="${art.image}" alt="${escapeHTML(art.title)}" loading="lazy">
                <span class="art-comment-badge" data-art-id="${art.id}">💬 0</span>
            </div>
            <div class="art-info">
                <h3 class="art-title">${escapeHTML(art.title)}</h3>
                <p class="art-author">by ${escapeHTML(art.author)}</p>
            </div>
        `;

        card.addEventListener('click', () => openLightbox(art.id));
        masonry.appendChild(card);
    });
}

// ---------- Disqus 评论数加载 ----------
function loadDisqusCommentCounts() {
    // 构建每张画作的 identifier 数组
    const threadIdentifiers = artworks.map(art => 'ident:' + art.id + '-' + art.title);

    // 使用 JSONP 调用 Disqus API
    const script = document.createElement('script');
    script.src = `https://disqus.com/api/3.0/threads/set.jsonp?` +
        `api_key=${encodeURIComponent(DISQUS_API_KEY)}` +
        `&forum=${DISQUS_SHORTNAME}` +
        `&thread=${threadIdentifiers.map(t => encodeURIComponent(t)).join('&thread=')}` +
        `&callback=onDisqusCountsLoaded`;
    document.head.appendChild(script);
}

// Disqus API 回调函数
function onDisqusCountsLoaded(response) {
    if (!response || !response.response) return;

    let totalCount = 0;

    // response.response 是一个数组，每个元素包含 identifier 和 posts
    response.response.forEach(thread => {
        const count = thread.posts || 0;
        totalCount += count;

        // 从 identifier 中解析 art_id（格式：art-1-实验）
        const identifier = thread.identifier || thread.id;
        const match = identifier.match(/art-(\d+)/);
        if (match) {
            const artId = match[1];
            const badge = document.querySelector(`.art-comment-badge[data-art-id="${artId}"]`);
            if (badge) {
                badge.textContent = `💬 ${count}`;
            }
        }
    });

    // 更新统计区的总评论数
    animateNumber('commentCount', totalCount);
}

// ---------- 导航栏滚动效果 ----------
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        const sections = document.querySelectorAll('section[id], header[id]');
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ---------- 灯箱 ----------
let currentArtId = null;

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');

    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

function openLightbox(artId) {
    const art = artworks.find(a => a.id === artId);
    if (!art) return;

    currentArtId = artId;

    document.getElementById('lightboxImage').src = art.image;
    document.getElementById('lightboxImage').alt = art.title;
    document.getElementById('lightboxTitle').textContent = art.title;
    document.getElementById('lightboxAuthor').textContent = `by ${art.author}`;

    // 加载该画作的 Disqus 评论
    loadDisqusComments(artId);

    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightbox.scrollTop = 0;
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    currentArtId = null;

    // 关闭灯箱后刷新评论数
    loadDisqusCommentCounts();
}

// ---------- Disqus 评论加载 ----------
function loadDisqusComments(artId) {
    window.DISQUS_IDENTIFIER = 'art-' + artId;

    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = 'art-' + artId;
                this.page.url = SITE_BASE_URL + '#art-' + artId;
                this.page.title = artworks.find(a => a.id === artId)?.title || '画作';
            }
        });
    }
}

// ---------- 统计数据 ----------
function updateStats() {
    animateNumber('artCount', artworks.length);
    const authors = new Set(artworks.map(a => a.author));
    animateNumber('authorCount', authors.size);
}

function animateNumber(elementId, target) {
    const el = document.getElementById(elementId);
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    const duration = 600;
    const steps = 30;
    const increment = (target - current) / steps;
    let step = 0;

    const timer = setInterval(() => {
        step++;
        if (step >= steps) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = Math.round(current + increment * step);
        }
    }, duration / steps);
}

// ---------- 回到顶部 ----------
function initBackTop() {
    const btn = document.getElementById('backTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ---------- 工具函数 ----------
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
