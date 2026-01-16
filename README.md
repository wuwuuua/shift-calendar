# 个人排班日历订阅系统

一个简单的排班日历管理工具,支持导出 ICS 文件供 iPhone 订阅。

## 功能特性

- 📅 日历视图,支持任意年份月份查看
- 🔄 四种排班状态:早班(D)、中班(S)、晚班(N)、休息(R)
- 💾 数据本地存储,刷新不丢失
- 📤 导出 ICS 文件,支持 iPhone 日历订阅
- 🎨 简洁现代的界面设计

## 排班说明

- **D (早班)**:08:00-16:00
- **S (中班)**:16:00-24:00
- **N (晚班)**:00:00-08:00
- **R (休息)**:休息日

## 使用方法

### 1. 编辑排班

- 点击日期即可循环切换排班状态:D → S → N → R → 无
- 使用顶部导航切换月份
- 使用下拉框快速选择年份和月份
- 点击"返回今天"快速回到当前月份

### 2. 导出 ICS 文件

- 编辑完当月排班后,点击右上角"导出 ICS"按钮
- 下载 `shift-calendar-YYYY-MM.ics` 文件

### 3. 上传到 GitHub

```bash
# 创建仓库
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/your-username/shift-calendar.git
git branch -M main
git push -u origin main
```

### 4. iPhone 订阅

1. 复制 GitHub raw 文件链接:
   ```
   https://raw.githubusercontent.com/your-username/shift-calendar/main/shift-calendar-2025-01.ics
   ```

2. 在 iPhone 上:
   - 打开"设置" → "日历" → "账户" → "添加账户" → "其他"
   - 选择"添加已订阅的日历"
   - 粘贴链接并保存

3. 排班日历会自动同步到你的 iPhone 日历

## 本地运行

直接用浏览器打开 `index.html` 即可使用。

## 技术栈

- HTML5 + CSS3 + Vanilla JavaScript
- localStorage 数据存储
- CSS Grid 布局
- ICS (RFC 5545) 日历格式

## 许可证

MIT
