# GitHub Pages 部署指南

这个指南将帮助您将英语单词卡片PWA应用部署到GitHub Pages。

## 步骤1：准备您的GitHub账户

1. 如果您还没有GitHub账户，请在 [GitHub](https://github.com/) 上注册一个账户
2. 登录您的GitHub账户

## 步骤2：创建新仓库

1. 点击GitHub个人页面右上角的 "+" 按钮，然后选择 "New repository"
2. 填写仓库名称，例如 `wordcards-pwa`
3. 可选：添加描述
4. 选择仓库为"Public"（必须是公开的才能使用GitHub Pages的免费版本）
5. 点击 "Create repository" 按钮

## 步骤3：上传文件

您有几种方式可以上传文件：

### 方法1：通过GitHub网页界面

1. 在您新创建的仓库页面，点击 "uploading an existing file" 链接
2. 拖放所有应用文件和文件夹到上传区域
3. 确保保持正确的目录结构（查看`directory-structure.txt`）
4. 添加提交信息，例如 "Initial commit"
5. 点击 "Commit changes" 按钮

### 方法2：使用Git命令行（推荐）

如果您熟悉Git，可以使用以下命令：

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/wordcards-pwa.git

# 进入项目目录
cd wordcards-pwa

# 复制所有应用文件到此目录

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit"

# 推送到GitHub
git push origin main
```

## 步骤4：配置GitHub Pages

1. 在仓库页面，点击 "Settings" 标签
2. 在左侧导航中，点击 "Pages"
3. 在 "Source" 部分，选择 "Deploy from a branch"
4. 在 "Branch" 下拉菜单中，选择 "main"，然后选择 "/ (root)"
5. 点击 "Save" 按钮

## 步骤5：等待部署完成

GitHub Pages可能需要几分钟时间来部署您的站点。部署完成后，您会在GitHub Pages设置页面上看到一个绿色的成功消息，其中包含您的网站URL，通常格式为：

```
https://YOUR_USERNAME.github.io/wordcards-pwa/
```

## 步骤6：测试您的PWA

1. 使用提供的URL访问您的应用
2. 在桌面浏览器中测试所有功能
3. 在移动设备上测试应用，并尝试"添加到主屏幕"功能

## 步骤7：修复Service Worker路径（如果需要）

由于GitHub Pages将您的应用托管在子目录中，可能需要修改service-worker.js中的路径。如果您遇到离线功能不工作的问题，请修改以下文件：

1. 打开 `service-worker.js`
2. 将缓存资源路径修改为（包含您的仓库名）：

```javascript
const CACHE_ASSETS = [
  '/wordcards-pwa/',
  '/wordcards-pwa/index.html',
  '/wordcards-pwa/css/styles.css',
  '/wordcards-pwa/js/app.js',
  '/wordcards-pwa/js/url-handler.js',
  '/wordcards-pwa/manifest.json',
  '/wordcards-pwa/images/icon-192.png',
  '/wordcards-pwa/images/icon-512.png',
  '/wordcards-pwa/images/favicon.ico'
];
```

2. 同样，修改 `index.html` 中的Service Worker注册路径：

```javascript
navigator.serviceWorker.register('/wordcards-pwa/service-worker.js')
```

3. 修改 `manifest.json` 中的start_url：

```json
"start_url": "/wordcards-pwa/index.html",
```

4. 提交这些更改并推送到GitHub

## 步骤8：自定义域名（可选）

如果您想使用自己的域名而不是GitHub Pages提供的域名：

1. 在仓库中创建一个名为 `CNAME` 的文件
2. 在文件中输入您的域名（例如 `wordcards.yourdomain.com`）
3. 在您的域名注册商处，添加一个CNAME记录，指向 `YOUR_USERNAME.github.io`
4. 保存更改并提交

## 问题排查

1. **应用无法离线工作**：检查Service Worker路径是否正确
2. **PWA无法安装**：确保manifest.json路径正确，并且已包含所有必要的图标
3. **图片不显示**：检查图像文件路径是否正确

## 更新应用

当您需要更新应用时，只需将新文件推送到GitHub仓库，GitHub Pages将自动重新部署您的应用。

请记住增加service-worker.js中的缓存版本名称（例如从`wordcards-cache-v1`到`wordcards-cache-v2`），以确保用户获取最新版本。