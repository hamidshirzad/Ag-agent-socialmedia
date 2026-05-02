# Pro-Components Templates

这个目录包含可复用的 Pro-Components 组件级模板（简化版）。

**注意**：完整的页面示例（包含 types、API、样式等）请查看 `../references/` 目录。

## 可用模板

### 表格组件
- **BasicTable.tsx** - 基础 ProTable 示例
  - 基本列定义
  - 分页配置
  - 搜索表单

### 表单组件  
- **BasicForm.tsx** - 基础 ProForm 示例
  - 常用表单字段
  - 表单验证
  - 提交处理

- **ModalForm.tsx** - 弹窗表单示例
  - ProFormModal 用法
  - 触发方式
  - 表单提交

## 使用方式

这些模板提供组件级的快速参考，但在实际项目中应该参考 `references/` 目录的完整示例：

- `references/table-page.md` - 完整列表页（包含 request、类型定义、样式）
- `references/form-page.md` - 完整表单页（包含 useQuery、Zod 校验）
- `references/detail-page.md` - 完整详情页（包含 useQuery、ProDescriptions）

## 模板 vs References

| 项目 | templates/ | references/ |
|------|-----------|-------------|
| 复杂度 | 简化的组件示例 | 完整的页面示例 |
| 类型定义 | 无 | ✅ 使用 Zod |
| API 层 | 无 | ✅ 完整 API 函数 |
| 数据请求 | 简化 | ✅ useQuery/ProTable request |
| 样式 | 简化 | ✅ styled-components |
| 用途 | 快速参考语法 | **生产级代码模板** |

**推荐**：生成完整页面时使用 `references/` 下的模板。
