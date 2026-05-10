// ========================================
// 漂流本画展 - JavaScript (Disqus 评论版)
// ========================================

// ---------- 画作数据 ----------
const artworks = [
    { id: 1, image: 'images/art-1.png', title: '实验', author: '漂流本' },
    { id: 2, image: 'images/art-2.jpeg', title: '实验', author: '漂流本' },
    { id: 3, image: 'images/art-3.jpeg', title: '实验', author: '漂流本' },
    { id: 4, image: 'images/art-4.jpeg', title: '实验', author: '漂流本' },
    { id: 5, image: 'images/art-5.png', title: '实验', author: '漂流本' },
    { id: 6, image: 'images/art-6.jpeg', title: '实验', author: '漂流本' },
    { id: 7, image: 'images/art-7.jpeg', title: '实验', author: '漂流本' }
];

// ---------- 初始化 ----------
document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
    initNavbar();
    initLightbox();
    initBackTop();
    updateStats();
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
                <span class="art-comment-badge">💬 留言</span>
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
}

// ---------- Disqus 评论加载 ----------
function loadDisqusComments(artId) {
    // 设置当前画作的唯一标识
    window.DISQUS_IDENTIFIER = 'art-' + artId;

    // 重置 Disqus 并加载新评论
    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = 'art-' + artId;
                this.page.url = window.location.href.split('#')[0] + '#art-' + artId;
                this.page.title = artworks.find(a => a.id === artId)?.title || '画作';
            }
        });
    }
    // 如果 DISQUS 还没加载完，embed.js 会自动使用 DISQUS_IDENTIFIER
}

// ---------- 统计数据 ----------
function updateStats() {
    animateNumber('artCount', artworks.length);
    animateNumber('commentCount', 0); // Disqus 评论数无法在前端获取
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
