// ========================================
// 漂流本画展 - JavaScript
// ========================================

// ---------- 示例画作数据 ----------
// 你可以替换成自己的画作信息
// image: 图片地址（可以是相对路径如 images/01.jpg，也可以是网络链接）
// title: 画作标题
// author: 作者名字
const artworks = [
    {
        id: 1,
        image: 'images/art-1.png',
        title: '实验',
        author: '漂流本',
        comments: []
    },
    {
        id: 2,
        image: 'images/art-2.jpeg',
        title: '实验',
        author: '漂流本',
        comments: []
    },
    {
        id: 3,
        image: 'images/art-3.jpeg',
        title: '实验',
        author: '漂流本',
        comments: []
    },
    {
        id: 4,
        image: 'images/art-4.jpeg',
        title: '实验',
        author: '漂流本',
        comments: []
    },
    {
        id: 5,
        image: 'images/art-5.png',
        title: '实验',
        author: '漂流本',
        comments: []
    }
];

// ---------- 初始化 ----------
document.addEventListener('DOMContentLoaded', () => {
    loadComments();
    renderGallery();
    initNavbar();
    initLightbox();
    initBackTop();
    updateStats();
});

// ---------- 评论存储（localStorage）----------
function loadComments() {
    const saved = localStorage.getItem('artwork_comments');
    if (saved) {
        const parsed = JSON.parse(saved);
        artworks.forEach(art => {
            if (parsed[art.id]) {
                art.comments = parsed[art.id];
            }
        });
    }
}

function saveComments() {
    const data = {};
    artworks.forEach(art => {
        data[art.id] = art.comments;
    });
    localStorage.setItem('artwork_comments', JSON.stringify(data));
}

// ---------- 渲染画廊 ----------
function renderGallery() {
    const masonry = document.getElementById('masonry');
    masonry.innerHTML = '';

    artworks.forEach(art => {
        const card = document.createElement('div');
        card.className = 'art-card';
        card.setAttribute('data-id', art.id);

        // 最新一条评论预览
        let previewHTML = '';
        if (art.comments.length > 0) {
            const latest = art.comments[art.comments.length - 1];
            previewHTML = `
                <div class="art-preview-comments">
                    <p class="art-preview-comment"><strong>${escapeHTML(latest.name)}</strong>：${escapeHTML(latest.text)}</p>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="art-image-wrap">
                <img class="art-image" src="${art.image}" alt="${escapeHTML(art.title)}" loading="lazy">
                <span class="art-comment-badge">💬 ${art.comments.length}</span>
            </div>
            <div class="art-info">
                <h3 class="art-title">${escapeHTML(art.title)}</h3>
                <p class="art-author">by ${escapeHTML(art.author)}</p>
                ${previewHTML}
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

        // 更新活动链接
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
    const form = document.getElementById('commentForm');

    closeBtn.addEventListener('click', closeLightbox);

    // 点击背景关闭
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // ESC 关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // 提交评论
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitComment();
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

    renderComments(art);

    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    // 滚动到顶部
    lightbox.scrollTop = 0;
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    currentArtId = null;

    // 重新渲染画廊以更新评论预览
    renderGallery();
    updateStats();
}

// ---------- 评论渲染 ----------
function renderComments(art) {
    const list = document.getElementById('commentsList');
    const count = document.getElementById('commentsCount');

    count.textContent = art.comments.length;

    if (art.comments.length === 0) {
        list.innerHTML = '<p class="no-comments">还没有留言，来写下第一条吧 ✨</p>';
        return;
    }

    list.innerHTML = art.comments.map(c => `
        <div class="comment-item">
            <div class="comment-avatar">${escapeHTML(c.name.charAt(0))}</div>
            <div class="comment-body">
                <span class="comment-name">${escapeHTML(c.name)}<span class="comment-time">${c.time}</span></span>
                <p class="comment-text">${escapeHTML(c.text)}</p>
            </div>
        </div>
    `).join('');
}

// ---------- 提交评论 ----------
function submitComment() {
    const nameInput = document.getElementById('commentName');
    const textInput = document.getElementById('commentText');
    const name = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!name || !text) return;

    const art = artworks.find(a => a.id === currentArtId);
    if (!art) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    art.comments.push({ name, text, time: timeStr });
    saveComments();

    renderComments(art);

    nameInput.value = '';
    textInput.value = '';
}

// ---------- 统计数据 ----------
function updateStats() {
    const totalComments = artworks.reduce((sum, a) => sum + a.comments.length, 0);
    const authors = new Set(artworks.map(a => a.author));

    animateNumber('artCount', artworks.length);
    animateNumber('commentCount', totalComments);
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

function pad(n) {
    return n < 10 ? `0${n}` : n;
}
