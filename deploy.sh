#!/bin/bash
# GitHub Pages 部署脚本
# 使用方法: ./deploy.sh YOUR_GITHUB_TOKEN

set -e

TOKEN=$1
REPO="xiaoyu1afa8/portfolio"

if [ -z "$TOKEN" ]; then
    echo "❌ 错误: 请提供 GitHub Token"
    echo "使用方法: ./deploy.sh YOUR_GITHUB_TOKEN"
    echo ""
    echo "如何获取 GitHub Token:"
    echo "1. 访问 https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token (classic)'"
    echo "3. 勾选 'repo' 权限"
    echo "4. 生成后复制 token"
    exit 1
fi

echo "🚀 开始部署到 GitHub Pages..."

# 配置远程仓库（使用 token 认证）
git remote remove origin 2>/dev/null || true
git remote add origin "https://${TOKEN}@github.com/${REPO}.git"

# 推送代码
echo "📤 推送代码到 GitHub..."
git push -u origin main --force

echo ""
echo "✅ 代码推送成功！"
echo ""
echo "🌐 现在请在 GitHub 上启用 Pages:"
echo "1. 访问 https://github.com/${REPO}/settings/pages"
echo "2. Source 选择 'Deploy from a branch'"
echo "3. Branch 选择 'main'，文件夹选择 '/ (root)'"
echo "4. 点击 Save"
echo ""
echo "⏳ 等待 1-2 分钟后，你的网站将上线："
echo "   https://xiaoyu1afa8.github.io/portfolio"
echo ""
echo "🎉 部署完成！"
