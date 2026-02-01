+++
date = '2026-02-01T11:58:07+08:00'
draft = true
title = 'AI辅助教程'
+++


这是基于我们刚才排查过的所有坑（环境报错、配置乱码、Git权限、部署冲突、文章不显示等），为你量身定制的**“避坑版”极简教程**。

这套方案采用 **Hugo + GitHub Actions (自动部署)** 方案。这是目前最稳定、最省心的方案，你只需要配置一次，以后写文章只需要“三行命令”。

---

### 🛠 第一步：环境与建站
假设你已经安装好了 Git 和 VS Code。

1.  **安装 Hugo (Windows 推荐)**
    打开 CMD 或 PowerShell：
    ```bash
    winget install Hugo.Hugo.Extended
    ```
    *(安装完后重启电脑，或者重启终端)*

2.  **创建博客项目**
    找个盘符（比如 D 盘），右键打开 Git Bash：
    ```bash
    # 1. 创建站点
    hugo new site myblog
    cd myblog

    # 2. 初始化 Git
    git init

    # 3. 下载主题 (直接下载，避开 submodule 报错坑)
    git clone https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod --depth=1
    ```

---

### ⚙️ 第二步：配置核心文件 (直接复制，不要改乱)

用 VS Code 打开 `myblog` 文件夹，找到 **`hugo.toml`**，全选删除，粘贴以下内容：

```toml
baseURL = 'https://你的用户名.github.io/'
languageCode = 'zh-cn'
title = '我的博客'
theme = 'PaperMod'

# 注意：不要加 publishDir = "docs"，我们用自动脚本处理

[params]
  defaultTheme = "auto"

[params.homeInfoParams]
  Title = "你好，我是博主"
  Content = "欢迎来到我的个人博客"

[[menu.main]]
  name = "文章"
  url = "/posts"
  weight = 1
```

---

### 📝 第三步：写第一篇文章 (注意格式)

在终端输入：`hugo new posts/hello.md`
然后打开该文件，**确保头部信息是这样的（TOML 格式）**：

```toml
+++
title = "我的第一篇文章"
date = 2024-05-01T12:00:00+08:00
draft = false
+++

这里写正文...
(注意：date 不要写未来的时间，draft 必须是 false)
```

---

### 🤖 第四步：配置自动部署脚本 (一次性工作)

1.  在项目根目录下，手动新建文件夹：**`.github`**
2.  在 `.github` 里面新建文件夹：**`workflows`**
3.  在 `workflows` 里面新建文件：**`deploy.yml`**
4.  粘贴以下内容（这是让机器人干活的指令）：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main  # 监听 main 分支

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true  # Fetch Hugo themes (true OR recursive)
          fetch-depth: 0    # Fetch all history for .GitInfo and .Lastmod

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build
        run: hugo --minify

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public  # 机器人把这里生成的网页发布出去
```

---

### 🔐 第五步：GitHub 仓库与权限设置 (最关键！)

1.  **去 GitHub 创建仓库：** 仓库名必须是 `你的用户名.github.io`。
2.  **设置权限 (解决 403 报错)：**
    *   进入仓库 -> **Settings** -> **Actions** -> **General**。
    *   拉到最下 **Workflow permissions**。
    *   勾选 **Read and write permissions**。
    *   点击 **Save**。

---

### 🚀 第六步：推送到 GitHub

回到本地 Git Bash，执行：

```bash
# 1. 关联远程仓库 (如果你还没做过)
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
# 如果提示已存在，用 git remote set-url origin ...

# 2. 推送三连击
git add .
git commit -m "首次发布"
git push -u origin main
```

*(如果网络卡住，记得开手机热点；如果提示冲突，用 `git push -f origin main`)*

---

### 🌍 第七步：最后的开关

1.  等待 GitHub Actions 跑完（仓库页面顶部 Actions 标签变绿）。
2.  进入仓库 -> **Settings** -> **Pages**。
3.  **Build and deployment** 设置：
    *   **Source:** Deploy from a branch
    *   **Branch:** 选 **`gh-pages`** (注意：机器人会自动创建这个分支)
    *   **Folder:** 选 **`/(root)`**
4.  点击 Save。

等待 1 分钟，访问 `https://你的用户名.github.io`，成功！

---

### 📅 以后怎么写新文章？(日常流程)

以后你只需要做这几步，**不需要**再动配置，也**不需要**管 public 文件夹：

1.  `hugo new posts/新文章.md`
2.  写内容，改 `draft = false`。
3.  执行推送命令：
    ```bash
    git add .
    git commit -m "新文章"
    git push
    ```
4.  **结束！** 剩下的交给机器人，喝杯茶等网站自动更新。
