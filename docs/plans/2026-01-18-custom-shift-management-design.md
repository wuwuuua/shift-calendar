# 自定义班次管理功能设计

**日期**: 2026-01-18
**功能**: 允许用户添加、编辑、删除自定义班次

## 概述

允许用户完全自定义班次配置，包括名称、描述、时间、颜色和快捷键，取代当前硬编码的 D、S、N、W 班次。

## 数据模型

### 班次配置结构

```javascript
// 存储键: 'shiftTypes'
{
  "shifts": [
    {
      "id": "uuid-1",              // 唯一标识符
      "label": "早班",              // 显示标签
      "description": "负责上午工作", // 描述
      "startTime": "08:30",         // 开始时间
      "endTime": "17:30",           // 结束时间
      "color": "#3B82F6",           // 颜色
      "hotkey": "d",                // 快捷键（可选）
      "isNextDay": false            // 跨天标志
    }
  ],
  "version": 1                      // 数据版本号
}
```

### 排班记录变更

排班记录从存储班次字符改为存储班次 ID：

```javascript
// 旧格式
{
  "2026-01-18": "D"
}

// 新格式
{
  "2026-01-18": "uuid-1"
}
```

## 架构设计

### 新增模块

**`js/shiftManager.js`** - 班次管理器

提供以下 API：

```javascript
// 获取所有班次
ShiftManager.getAll(): Array<Shift>

// 根据 ID 获取班次
ShiftManager.getById(id: string): Shift | null

// 根据快捷键获取班次
ShiftManager.getByHotkey(key: string): Shift | null

// 添加班次
ShiftManager.add(shift: Omit<Shift, 'id'>): string

// 更新班次
ShiftManager.update(id: string, data: Partial<Shift>): boolean

// 删除班次
ShiftManager.delete(id: string): boolean

// 从旧格式迁移数据
ShiftManager.migrateFromOldFormat(): void

// 检查快捷键冲突
ShiftManager.isHotkeyConflict(hotkey: string, excludeId?: string): boolean
```

### 修改模块

**`js/calendar.js`**
- 移除硬编码的 `SHIFT_TYPES` 常量
- 从 `ShiftManager` 获取班次配置
- 更新快捷键监听逻辑，使用动态配置

**`js/storage.js`**
- 更新数据结构以存储班次 ID
- 添加数据迁移逻辑

**`js/ics.js`**
- 更新以使用新的班次数据结构

## UI 设计

### 主界面变更

在 header 添加"班次管理"按钮：

```html
<button id="manageShiftsBtn" class="btn-manage">
  <svg>齿轮图标</svg>
  班次管理
</button>
```

位置：清空数据按钮之前

### 班次管理弹窗

**布局结构：**

```
┌─────────────────────────────────────┐
│  班次管理                      [×]   │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ ┃ 早班                    [编辑]│  │
│  │ ┃ 负责上午工作               [删除]│  │
│  │ ┃ 08:30 - 17:30  [快捷键: D] │  │
│  ├───────────────────────────────┤  │
│  │ ┃ 中班                    [编辑]│  │
│  │ ┃ 负责下午工作               [删除]│  │
│  │ ┃ 16:00 - 24:00  [快捷键: S] │  │
│  └───────────────────────────────┘  │
│                                     │
│  [+ 添加班次]                        │
└─────────────────────────────────────┘
```

**班次卡片样式：**
- 左侧颜色条（8px 宽）
- 班次标签（18px，加粗）
- 描述（14px，灰色）
- 时间显示
- 快捷键徽章（如果有，灰色圆角矩形）
- 操作按钮（编辑、删除，图标按钮）

### 添加/编辑班次表单

**字段：**

1. **班次标签**（必填，最大 10 字符）
   - 文本输入框
   - 示例："早班"

2. **描述**（可选，最大 50 字符）
   - 文本输入框
   - 示例："负责上午工作，含午餐时间"

3. **开始时间**
   - 时间选择器（type="time"）
   - 格式：HH:MM

4. **结束时间**
   - 时间选择器（type="time"）
   - 格式：HH:MM

5. **跨天选项**
   - 复选框
   - 自动根据时间判断（结束 < 开始时勾选）

6. **颜色**
   - 颜色选择器
   - 预设 12 种颜色供快速选择

7. **快捷键**（可选）
   - 单字符输入框
   - 实时检测冲突并提示

**表单验证：**
- 标签不能为空
- 开始和结束时间必填
- 快捷键不能重复

## 快捷键系统

### 规则

- 支持单个字母（a-z，不区分大小写）
- 支持数字（0-9）
- 快捷键可选（班次可以没有快捷键）
- 自动检测冲突

### 交互

1. 用户按下快捷键
2. 高亮显示当前选中的日期（如果有）
3. 点击日期时应用该班次
4. 显示快捷键提示（类似现在）

### 冲突处理

- 表单中输入快捷键时实时检测
- 如果冲突，显示警告："该快捷键已被 [班次名称] 使用"
- 阻止保存重复的快捷键

## 数据迁移

### 迁移流程

首次加载时执行：

```javascript
if (!localStorage.getItem('shiftTypes')) {
  // 1. 从现有的 SHIFT_TYPES 创建默认班次
  const defaultShifts = [
    { id: generateUUID(), label: 'D', ...SHIFT_TYPES.D, hotkey: 'd' },
    { id: generateUUID(), label: 'S', ...SHIFT_TYPES.S, hotkey: 's' },
    { id: generateUUID(), label: 'N', ...SHIFT_TYPES.N, hotkey: 'n' },
    { id: generateUUID(), label: 'W', ...SHIFT_TYPES.W, hotkey: 'w' }
  ];

  // 2. 保存新的班次配置
  localStorage.setItem('shiftTypes', JSON.stringify({
    shifts: defaultShifts,
    version: 1
  }));

  // 3. 迁移现有的排班记录
  const shiftMap = { 'D': defaultShifts[0].id, 'S': defaultShifts[1].id, ... };
  const allData = Storage.getAll();
  const migratedData = {};
  for (const [date, shiftChar] of Object.entries(allData)) {
    migratedData[date] = shiftMap[shiftChar];
  }
  localStorage.setItem('shiftData', JSON.stringify(migratedData));
}
```

### 回退计划

- 保留旧数据格式备份
- 如果迁移失败，可从备份恢复

## CSS 样式

### 新增样式类

```css
/* 班次管理按钮 */
.btn-manage {
  background: #6B7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

/* 班次卡片 */
.shift-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  margin-bottom: 12px;
}

.shift-card-color {
  width: 8px;
  height: 60px;
  border-radius: 4px;
  margin-right: 16px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
}

/* 颜色选择器 */
.color-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
}

.color-option.selected {
  border-color: #1F2937;
}

/* 快捷键输入 */
.hotkey-input {
  width: 60px;
  text-align: center;
  text-transform: uppercase;
}
```

## 测试计划

### 功能测试

1. **数据迁移**
   - 首次加载自动创建默认班次
   - 旧排班数据正确迁移

2. **班次管理**
   - 添加新班次
   - 编辑现有班次
   - 删除班次（检查是否有排班使用）
   - 数据正确保存到 localStorage

3. **快捷键**
   - 正确识别快捷键
   - 快捷键冲突检测
   - 删除班次后快捷键释放

4. **ICS 导出**
   - 导出包含自定义班次的日历
   - 时间和描述正确

### 边界情况

- 删除正在使用的班次
- 所有班次都被删除
- 快捷键用尽（26 个字母 + 10 个数字）
- 时间跨天（夜班）
- 颜色重复

## 实现步骤

1. ✅ 设计文档
2. ⏳ 创建 git worktree
3. ⏳ 实现 `ShiftManager` 模块
4. ⏳ 实现数据迁移逻辑
5. ⏳ 创建班次管理弹窗 UI
6. ⏳ 实现添加/编辑班次表单
7. ⏳ 更新日历显示逻辑
8. ⏳ 更新快捷键系统
9. ⏳ 更新统计显示
10. ⏳ 更新 ICS 导出
11. ⏳ 测试并修复 bug
12. ⏳ 合并到主分支

## 技术要点

- UUID 生成使用 `crypto.randomUUID()` 或简单的随机字符串
- 颜色选择器使用 `<input type="color">` + 预设选项
- 时间处理使用原生 `Date` 对象
- 模态框使用原生 `<dialog>` 或自定义 overlay

## 性能考虑

- 班次配置通常少于 20 个，性能不是问题
- 排班记录按月加载，避免一次性加载过多数据
- 颜色选择器预设颜色减少渲染开销
