使用Hugo 搭建博客并部署到 GitHub Pages
April 4, 2025
本教程将从 0 开始，手把手教你在 Windows 系统中使用 Hugo 创建一个静态博客，并通过 GitHub Actions 自动部署到 GitHub Pages.

🧰 一、准备工作
✅ 1. 安装 Git
下载并安装：https://git-scm.com
安装完成后，右键菜单应该出现 “Git Bash Here”
验证安装：
# 打开 power shell 检查 git 安装成功
git --version
✅ 2. 安装 Hugo（建议扩展版）
仅需在 power shell 输入
# 安装
winget install Hugo.Hugo.Extended

# 如需卸载
winget uninstall --name "Hugo (Extended)"

# 检查 Hugo是否安装成功 (重启终端 或 重启电脑)
hugo version
✅ 3. 注册 GitHub 并创建仓库
Github 注册: https://github.com
创建一个与你用户名相同的仓库，比如:
<Github用户名>.github.io
tu

🏗 二、创建 Hugo 博客项目
在本地找个位置存储 源代码
# 创建文件夹
mkdir blog

# 打开文件夹
cd blog

# 使用 hugo 创建文件夹(此处是您的代码仓库)
hugo new site <你的文件夹名>

#打开你的文件夹
cd <你的文件夹名>
🎨 三、添加主题 PaperMod
(此处使用 主题 - PaperMod 作为例子)

在当前文件夹目录下 powershell :
# git初始化本地仓库
git init

# 将 PaperMod下载到本地
git submodule add \
    https://github.com/adityatelange/hugo-PaperMod.git \
    themes/PaperMod  
如果 git submodule add 不行，则可以网页浏览到PaperMod主页点击 <>Code 下载 zip 文件，压缩文件将文件名改为 PaperMod 并复制粘贴到当前themes目录下即可。
📝 四、配置 hugo.toml
将下面代码复制粘贴到hugo.toml下。
baseURL = 'https://你的用户名.github.io/'
languageCode = 'zh-cn'
title = '我的博客'
theme = 'PaperMod'

[params]
  defaultTheme = "auto"
  # 这里 homeInfoParams 下注意不要换行，否则 hugo server可能打开不了（复制时候删除这行注释）
  homeInfoParams = { 
    Title = "你好，我是 <你的用户名> ", Content = "欢迎来到我的博客主页：个人 / 博客 / 教程 " 
  }

[[menu.main]]
  name = "个人"
  url = "/posts"
  weight = 1

[[menu.main]]
  name = "教程"
  url = "/docs"
  weight = 2

[[menu.main]]
  name = "学习"
  url = "/study"
  weight = 3
baseURL: 访问你个人网页的链接;
url: 链接的是当前目录下content下的文件夹;
weight: 表示网页部署位置
后续视个人情况修改
✍️ 五、写第一篇文章
# 在当前 根目录 下输入
hugo new posts/hello-hugo.md
使用hugo new会链接脚本创建markdown的上述链接:
---
title: "你好 Hugo"
date: 2025-04-04
draft: false
---
在当前md下输入<您的内容>:
---
title: "你好 Hugo"
date: 2025-04-04
draft: false
---

这是我的第一篇文章！我正在学习 Hugo 😊
🌐 六、本地预览网站 & 📁 构建 public/ 文件夹
# 当前根目录下输入
hugo server -D

# 使用浏览器打开，查看效果
http://localhost:1313
当你想部署网站时，运行：
hugo
这条命令会生成 public/ 文件夹，它包含了 构建好的静态网页内容，可以直接部署。
你部署到网页上的内容应该是在 public/ 下
# 进入 public/ 目录并初始化 Git
cd public
git init
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
git checkout -b gh-pages

# 提交构建结果并推送到 gh-pages 分支
git add .
git commit -m "手动部署 Hugo 页面"
git push -f origin gh-pages
在 GitHub 设置 Pages 分支
打开你的 GitHub 仓库
点击菜单栏 Settings → Pages
在 Source 选项中选择：
分支：gh-pages
目录：/(root)
保存并等待 GitHub 自动生成网页（几分钟内）tu
🚀 七、部署到 GitHub Pages（使用 Actions 自动部署）
1. 初始化 git 并推送到 GitHub
# 在根目录下
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:你的用户名/你的用户名.github.io.git
git push -u origin main
⚠️ 如果你使用的是 HTTPS，请把 git@github.com… 改为 https://github.com/你的用户名/你的用户名.github.io.git
2. 添加部署工作流
创建文件 (在根目录下).github/workflows/deploy.yml：(注意 .github 的文件夹也是自己创建的)
复制一下内容到 deploy.yml 下
name: Deploy Hugo site to GitHub Pages

on:
  push:
    branches:
      - main  # 👈 每次推送到 main 分支就会自动部署

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build Hugo site
        run: hugo --minify

      - name: Deploy to GitHub Pages 🚀
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
八、总结
每次想新写内容直接
# 文件存储在content下
hugo new <你的文件路径>

# 本地查看
hugo server -D

# 浏览器查看
http://localhost:1313

# 之后直接在根目录下,注意你当前的分支应该是 main
## 查看分支
git branch

git add .
git commit -m "你的日志"
git push origin main
此后你写的 deploy.yml 会在 actions 下自动部署网页，无需在进入到public下再次推送静态网页
您的网页源代码在main分支下，静态部署网页代码在pulic文件夹下(也是访问您网页的代码内容)
🛠 九、自动提交脚本（可选）
若您想省去 git add . 过程，以下提供python脚本参考

# 在当前 根目录 下创建auto_push.py
import subprocess
from datetime import datetime

def auto_push():
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    msg = f"update: {now}"
    subprocess.run(["git", "add", "."], check=True)
    subprocess.run(["git", "commit", "-m", msg], check=True)
    subprocess.run(["git", "push", "origin", "main"], check=True)

auto_push()
运行方式：
python auto_push.py
🎉 恭喜！
你已经成功在 Windows 环境下，使用 Hugo + GitHub Pages 创建并部署了自己的博客！