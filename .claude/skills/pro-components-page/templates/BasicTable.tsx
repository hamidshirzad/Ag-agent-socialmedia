import React, { useState } from 'react';
import { Table, Button, Space, Tag, Input } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: string;
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: string;
  createdAt: string;
}

const BasicTableTemplate: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  // Sample data
  const dataSource: DataType[] = [
    {
      key: '1',
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      role: 'Admin',
      createdAt: '2024-01-01',
    },
    {
      key: '2',
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'active',
      role: 'User',
      createdAt: '2024-01-02',
    },
    {
      key: '3',
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'inactive',
      role: 'User',
      createdAt: '2024-01-03',
    },
  ];

  const handleEdit = (record: DataType) => {
    console.log('Edit:', record);
    // Handle edit action
  };

  const handleDelete = (record: DataType) => {
    console.log('Delete:', record);
    // Handle delete action
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toString().toLowerCase()) ||
        record.email.toLowerCase().includes(value.toString().toLowerCase()),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'User', value: 'User' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by name or email"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default BasicTableTemplate;
