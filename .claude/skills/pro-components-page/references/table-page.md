# 列表页 (Table Page) 参考模板

使用 `ProTable` + `PageContainer` 创建标准列表页。

---

## 完整示例

### `types.ts`
```tsx
import { z } from 'zod';

// URL 查询参数 schema
export const productListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  keyword: z.string().optional(),
  status: z.enum(['on_sale', 'off_sale', 'all']).optional().default('all'),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

// 产品列表项数据类型
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  originalPrice: z.number().optional(),
  stock: z.number(),
  category: z.string(),
  brand: z.string(),
  status: z.enum(['on_sale', 'off_sale']),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  salesCount: z.number().default(0),
  rating: z.number().min(0).max(5).default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Product = z.infer<typeof productSchema>;

// API 响应
export const productListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    list: z.array(productSchema),
    total: z.number(),
  }),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
```

### `index.tsx` - 使用 ProTable request 参数
```tsx
import React, { useRef } from 'react';
import { useNavigate } from '@umijs/max';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Space, Popconfirm, Tag, message, Image } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import type { ProductListQuery, Product } from './types';

// ==================== 样式 ====================
const TableWrapper = styled.div`
  .ant-pro-table-search {
    margin-bottom: 0;
  }

  .status-tag {
    min-width: 56px;
    text-align: center;
  }

  .price-text {
    color: #ff4d4f;
    font-weight: 600;
    font-size: 14px;
  }

  .original-price {
    text-decoration: line-through;
    color: #999;
    font-size: 12px;
    margin-left: 8px;
  }
`;

const HeaderExtra = styled(Space)`
  .ant-btn-primary {
    border-radius: 6px;
  }
`;

// ==================== API 请求函数 ====================
async function fetchProductList(params: ProductListQuery) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== 'all') {
      searchParams.set(k, String(v));
    }
  });

  const res = await fetch(`/api/products?${searchParams}`);
  if (!res.ok) throw new Error(`请求失败: ${res.status}`);
  return res.json();
}

async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`删除失败: ${res.status}`);
}

// ==================== 主组件 ====================
const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>();

  // 删除操作
  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // ProTable 数据请求
  const request = async (params: any, sort: any, filter: any) => {
    try {
      const { current, pageSize, ...restParams } = params;

      // 构建查询参数
      const queryParams = {
        page: current || 1,
        pageSize: pageSize || 20,
        ...restParams,
      };

      const response = await fetchProductList(queryParams);

      if (response.success) {
        return {
          data: response.data.list,
          success: true,
          total: response.data.total,
        };
      }

      return {
        data: [],
        success: false,
        total: 0,
      };
    } catch (error) {
      message.error('加载数据失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 表格列定义
  const columns: ProColumns<Product>[] = [
    {
      title: '产品图片',
      dataIndex: 'imageUrl',
      search: false,
      width: 100,
      render: (_, record) =>
        record.imageUrl ? (
          <Image
            src={record.imageUrl}
            alt={record.name}
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview={false}
          />
        ) : (
          <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            暂无图片
          </div>
        ),
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (_, record) => (
        <a onClick={() => navigate(`/products/${record.id}`)}>{record.name}</a>
      ),
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      width: 120,
    },
    {
      title: '分类',
      dataIndex: 'category',
      valueType: 'select',
      width: 120,
      valueEnum: {
        electronics: { text: '电子产品' },
        clothing: { text: '服装' },
        food: { text: '食品' },
        books: { text: '图书' },
        sports: { text: '运动' },
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      search: false,
      width: 150,
      render: (_, record) => (
        <div>
          <span className="price-text">¥{record.price.toFixed(2)}</span>
          {record.originalPrice && record.originalPrice > record.price && (
            <span className="original-price">¥{record.originalPrice.toFixed(2)}</span>
          )}
        </div>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      search: false,
      width: 100,
      render: (_, record) => (
        <span style={{ color: record.stock < 10 ? '#ff4d4f' : undefined }}>
          {record.stock}
        </span>
      ),
    },
    {
      title: '销量',
      dataIndex: 'salesCount',
      search: false,
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      valueEnum: {
        on_sale: { text: '在售', status: 'Success' },
        off_sale: { text: '下架', status: 'Default' },
      },
      render: (_, record) => (
        <Tag className="status-tag" color={record.status === 'on_sale' ? 'green' : 'default'}>
          {record.status === 'on_sale' ? '在售' : '下架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      search: false,
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/products/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除？"
            description="删除后不可恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="产品管理"
      breadcrumb={{
        items: [{ title: '首页', path: '/' }, { title: '产品管理' }],
      }}
      extra={
        <HeaderExtra>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/products/create')}
          >
            新建产品
          </Button>
        </HeaderExtra>
      }
    >
      <TableWrapper>
        <ProTable<Product>
          rowKey="id"
          columns={columns}
          actionRef={actionRef}
          request={request}
          search={{
            labelWidth: 'auto',
            defaultCollapsed: false,
          }}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          toolBarRender={() => []}
          options={{
            reload: true,
          }}
        />
      </TableWrapper>
    </PageContainer>
  );
};

export default ProductListPage;
```

---

## ProTable 关键配置说明

| 配置项 | 说明 |
|--------|------|
| `request` | **推荐方式** - 使用 request 参数处理数据请求，ProTable 自动管理 loading 状态 |
| `actionRef` | 引用 ProTable 实例，用于手动触发刷新等操作 |
| `search` | 设置 `labelWidth: 'auto'` 自适应，`defaultCollapsed` 控制默认展开 |
| `pagination` | 使用非受控模式，让 ProTable 自动处理分页 |
| `options.reload` | 启用刷新按钮 |
| `valueEnum` | 配合 search 时支持下拉筛选 |

## request 函数返回格式

```typescript
return {
  data: [],        // 列表数据
  success: true,   // 请求是否成功
  total: 0,        // 数据总数
};
```

## 常用 ProColumns valueType

```tsx
valueType: 'text'      // 文本输入
valueType: 'select'    // 下拉选择（配合 valueEnum）
valueType: 'date'      // 日期选择
valueType: 'dateRange' // 日期范围
valueType: 'dateTime'  // 日期时间
valueType: 'digit'     // 数字
valueType: 'textarea'  // 多行文本（搜索时不常用）
```

## 最佳实践

1. **使用 actionRef** - 方便手动触发刷新 `actionRef.current?.reload()`
2. **使用 request 参数** - 让 ProTable 自动管理 loading、分页状态
3. **错误处理** - 在 request 中捕获错误并返回空数据
4. **类型安全** - 使用 Zod 定义数据结构和类型
5. **样式隔离** - 使用 styled-components 避免样式冲突

```tsx
import React, { useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Space, Popconfirm, Tag, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import styled from 'styled-components'

import { listQuerySchema } from './types'
import type { ListQuery, Resource } from './types'
import { fetchResourceList, deleteResource } from './api'

// ==================== 样式 ====================
const TableWrapper = styled.div`
  .ant-pro-table-search {
    margin-bottom: 0;
  }

  .status-tag {
    min-width: 56px;
    text-align: center;
  }
`

const HeaderExtra = styled(Space)`
  .ant-btn-primary {
    border-radius: 6px;
  }
`

// ==================== Query Keys ====================
const QUERY_KEYS = {
  list: (params: ListQuery) => ['resource', 'list', params] as const,
}

// ==================== 主组件 ====================
const ResourceListPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  // 解析 URL 参数（zod safeParse 容错处理）
  const rawParams = Object.fromEntries(searchParams.entries())
  const parseResult = listQuerySchema.safeParse(rawParams)
  const params = parseResult.success
    ? parseResult.data
    : listQuerySchema.parse({})

  // 更新 URL 参数
  const updateParams = useCallback(
    (newParams: Partial<ListQuery>) => {
      const merged = { ...params, ...newParams }
      const next = new URLSearchParams()
      Object.entries(merged).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) {
          next.set(k, String(v))
        }
      })
      setSearchParams(next)
    },
    [params, setSearchParams]
  )

  // 查询列表数据
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => fetchResourceList(params),
    staleTime: 30 * 1000,
  })

  // 删除操作
  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteResource,
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['resource'] })
    },
    onError: (err: Error) => {
      message.error(err.message || '删除失败')
    },
  })

  // 表格列定义
  const columns: ProColumns<Resource>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (_, record) => (
        <a onClick={() => navigate(`/resources/${record.id}`)}>{record.name}</a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: '启用', status: 'Success' },
        inactive: { text: '停用', status: 'Default' },
      },
      render: (_, record) => (
        <Tag
          className="status-tag"
          color={record.status === 'active' ? 'green' : 'default'}
        >
          {record.status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      search: false,
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/resources/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除？"
            description="删除后不可恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger loading={isDeleting}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer
      title="资源管理"
      breadcrumb={{
        items: [
          { title: '首页', path: '/' },
          { title: '资源管理' },
        ],
      }}
      extra={
        <HeaderExtra>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/resources/create')}
          >
            新建资源
          </Button>
        </HeaderExtra>
      }
    >
      <TableWrapper>
        <ProTable<Resource>
          rowKey="id"
          columns={columns}
          dataSource={data?.data}
          loading={isLoading}
          search={{
            labelWidth: 'auto',
            defaultCollapsed: false,
          }}
          // 受控分页
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total: data?.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => updateParams({ page, pageSize }),
          }}
          // 搜索表单提交
          onSubmit={(values) => {
            updateParams({ ...values, page: 1 })
          }}
          onReset={() => {
            setSearchParams(new URLSearchParams())
          }}
          toolBarRender={() => []}
          options={{
            reload: () => {
              queryClient.invalidateQueries({ queryKey: ['resource'] })
            },
          }}
        />
      </TableWrapper>
    </PageContainer>
  )
}

export default ResourceListPage
```

---

## ProTable 关键配置说明

| 配置项 | 说明 |
|--------|------|
| `request` vs `dataSource` | 使用 `dataSource` 配合 `useQuery` 受控，不用 `request` 回调 |
| `search` | 设置 `labelWidth: 'auto'` 自适应，`defaultCollapsed` 控制默认展开 |
| `pagination` | 受控模式，改变时调用 `updateParams` 更新 URL |
| `onSubmit` | 搜索表单提交时重置到第 1 页 |
| `options.reload` | 手动刷新时 invalidate query |
| `valueEnum` | 配合 search 时支持下拉筛选 |

## 常用 ProColumns valueType

```tsx
valueType: 'text'      // 文本输入
valueType: 'select'    // 下拉选择（配合 valueEnum）
valueType: 'date'      // 日期选择
valueType: 'dateRange' // 日期范围
valueType: 'dateTime'  // 日期时间
valueType: 'digit'     // 数字
valueType: 'textarea'  // 多行文本（搜索时不常用）
```
