---
name: pro-components-page
description: 使用 Ant Design Pro-Components 创建标准页面组件的技能。当用户需要创建后台管理页面、列表页、表单页、详情页时必须使用此技能。触发场景包括：创建 ProTable 列表页、ProForm 表单页、ProDescriptions 详情页、使用 PageContainer 包裹的页面、需要结合 useQuery 做接口请求、使用 zod 定义页面参数、使用 styled-components 写样式的任何页面组件。即使用户只是说"创建一个列表页"、"做个表单"、"写个详情页"、"创建 CRUD 页面"、"做个产品管理"也应触发此技能。
---

# Pro-Components Page Skill

使用 Ant Design Pro-Components 创建标准化后台页面组件。

## 技术栈规范

| 技术 | 用途 | 版本要求 |
|------|------|----------|
| `@ant-design/pro-components` | 页面组件（ProTable、ProForm、ProDescriptions） | ^2.x |
| `@umijs/max` | 框架（提供 useQuery、路由等） | ^4.x |
| `zod` | 参数校验与类型定义 | ^3.x |
| `styled-components` | CSS-in-JS 样式 | ^6.x |
| `antd` | 基础 UI 组件 | ^5.x |

---

## 页面类型选择

根据用户需求选择对应类型，详细代码模板见 references/ 目录：

- **列表页 (Table)** → 读取 `references/table-page.md`
- **表单页 (Form)** → 读取 `references/form-page.md`
- **详情页 (Detail)** → 读取 `references/detail-page.md`

---

## 通用规范（所有页面类型必须遵守）

### 1. PageContainer 包裹
所有页面必须用 `PageContainer` 作为根容器：
```tsx
<PageContainer
  title="页面标题"
  breadcrumb={{ items: [...] }}
  extra={[/* 操作按钮 */]}
>
  {/* 页面内容 */}
</PageContainer>
```

### 2. Zod 定义页面参数
使用 zod schema 定义并验证所有参数（URL query params、路由参数、表单数据）：
```tsx
import { z } from 'zod';

// URL 查询参数
const pageQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  keyword: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
});
type PageQuery = z.infer<typeof pageQuerySchema>;

// 使用 safeParse 安全解析
const parseResult = pageQuerySchema.safeParse(rawParams);
if (!parseResult.success) {
  // 处理错误或使用默认值
  const params = pageQuerySchema.parse({}); // 使用所有默认值
}
const params = parseResult.data;
```

### 3. useQuery 接口请求（UmiJS）

**列表页** - 使用 ProTable 的 `request` 参数：
```tsx
import { useRef } from 'react';
import type { ActionType } from '@ant-design/pro-components';

const actionRef = useRef<ActionType>();

const request = async (params: any, sort: any, filter: any) => {
  try {
    const { current, pageSize, ...restParams } = params;
    const response = await fetchList({ page: current, pageSize, ...restParams });
    
    return {
      data: response.data.list,
      success: true,
      total: response.data.total,
    };
  } catch (error) {
    message.error('加载失败');
    return { data: [], success: false, total: 0 };
  }
};

// ProTable 中使用
<ProTable
  actionRef={actionRef}
  request={request}
  // ...其他配置
/>

// 刷新数据
actionRef.current?.reload();
```

**表单页 / 详情页** - 使用 `useQuery`（来自 @umijs/max）：
```tsx
import { useQuery } from '@umijs/max';

// 获取详情
const {
  data: detail,
  isLoading,
  error,
} = useQuery({
  queryKey: ['resource', 'detail', id],
  queryFn: () => fetchResourceDetail(id!),
  enabled: !!id,
});

// 错误处理
React.useEffect(() => {
  if (error) {
    message.error((error as Error).message || '加载失败');
  }
}, [error]);
```

**变更操作（手动管理）**：
```tsx
const [isSubmitting, setIsSubmitting] = React.useState(false);

const handleSubmit = async (values: any) => {
  setIsSubmitting(true);
  try {
    await createResource(values);
    message.success('操作成功');
    history.back();
  } catch (error: any) {
    message.error(error.message || '操作失败');
  } finally {
    setIsSubmitting(false);
  }
};
```

### 4. styled-components 样式
- 所有自定义样式使用 styled-components，禁止内联 style
- 组件命名语义化
- 利用 antd className 做样式覆盖

```tsx
import styled from 'styled-components';

const PageWrapper = styled.div`
  .ant-pro-table {
    background: #fff;
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;
```

---

## 文件结构规范

```
src/pages/ResourceName/
├── index.tsx          # 列表页（使用 ProTable request）
├── form.tsx           # 表单页（使用 useQuery）
├── detail.tsx         # 详情页（使用 useQuery）
├── types.ts           # zod schema + 类型导出
└── components/        # 页面内子组件（可选）
    └── SomeModal.tsx
```

---

## 快速决策树

```
用户需求
  ├── 展示数据列表，支持分页/筛选/排序？ → 列表页 (Table) + ProTable request
  ├── 填写数据，新增或编辑记录？         → 表单页 (Form) + useQuery
  └── 查看某条记录的详细信息？           → 详情页 (Detail) + useQuery
```

---

## 参考文件说明

在生成代码前，**必须先读取**对应类型的参考文件：

- `references/table-page.md` — 列表页完整示例 + ProTable request 配置
- `references/form-page.md` — 表单页完整示例 + useQuery + ProForm 配置
- `references/detail-page.md` — 详情页完整示例 + useQuery + ProDescriptions 配置

如果用户需要组合页面（如列表页内嵌新建表单弹窗），同时读取两份参考文件。

---

## 关键最佳实践

1. **列表页使用 ProTable request** - 不要手动管理 loading 和 dataSource
2. **表单页/详情页使用 useQuery** - 自动管理加载状态和缓存
3. **Zod 校验** - 所有参数和表单数据使用 Zod 校验
4. **错误处理** - useQuery 的 error 需要用 useEffect 显示提示
5. **类型安全** - 使用 Zod infer 生成 TypeScript 类型
6. **样式隔离** - 使用 styled-components 避免全局污染
