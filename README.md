# 英语单词卡片学习系统 (PWA版)

这是一个使用HTML、CSS和JavaScript开发的英语单词卡片学习系统，支持PWA（渐进式网页应用），可以在桌面和移动设备上离线使用。

## 功能特点

- 创建、编辑和删除单词卡片
- 支持多级分类系统
- 难度评级系统
- 学习模式与记忆跟踪
- 学习日志与统计
- 数据导入/导出功能
- 完全离线工作，无需网络连接
- 可安装到手机主屏幕（PWA）
- 响应式设计，适配各种屏幕尺寸

## 部署到GitHub Pages

按照以下步骤部署应用到GitHub Pages：

1. 在GitHub上创建一个新的仓库

2. 将所有文件上传到仓库，保持以下目录结构：
   ```
   /
   ├── index.html
   ├── css/
   │   └── styles.css
   ├── js/
   │   └── app.js
   ├── images/
   │   ├── icon-192.png
   │   ├── icon-512.png
   │   └── favicon.ico
   ├── manifest.json
   ├── service-worker.js
   └── README.md
   ```

3. 在GitHub仓库设置中启用GitHub Pages：
   - 进入仓库的"Settings"
   - 滚动到"GitHub Pages"部分
   - 在"Source"下选择"main"分支
   - 点击"Save"

4. 几分钟后，您的应用将在 `https://<your-username>.github.io/<repository-name>/` 上可用

## 在移动设备上安装应用

1. 在移动设备的浏览器中访问应用URL
2. 对于iOS设备：
   - 在Safari中点击分享按钮
   - 选择"添加到主屏幕"
3. 对于Android设备：
   - 在Chrome中，点击菜单按钮
   - 选择"安装应用"或"添加到主屏幕"

## 自定义图标

应用需要两个尺寸的图标：
- 192x192像素
- 512x512像素

您可以使用如下工具创建自己的图标：
- [Canva](https://www.canva.com/)
- [Figma](https://www.figma.com/)
- [Adobe Express](https://www.adobe.com/express/)

将创建的图标放在`images`文件夹下，并确保在`manifest.json`中正确引用它们。

## 本地开发

由于PWA的安全要求，即使在本地开发中也需要通过HTTP服务器提供服务。可以使用以下方法之一：

1. 使用Visual Studio Code的Live Server扩展
2. 使用Python的简易HTTP服务器：
   ```
   python -m http.server
   ```
3. 使用Node.js的http-server：
   ```
   npx http-server
   ```

## 数据存储

应用使用浏览器的IndexedDB来存储卡片和学习日志。所有数据都保存在本地设备上，不会上传到任何服务器。

## 备份数据

强烈建议定期使用应用中的"导出数据"功能来备份您的卡片和学习进度。导出的JSON文件可以在需要时使用"导入数据"功能恢复。

## 浏览器兼容性

应用应该在所有现代浏览器中工作，包括：
- Chrome（推荐）
- Firefox
- Safari
- Edge

## 许可

此项目采用MIT许可证，可自由使用、修改和分发。