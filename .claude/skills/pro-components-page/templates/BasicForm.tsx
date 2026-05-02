import React from 'react';
import { Form, Input, Button, DatePicker, Select, InputNumber } from 'antd';
import type { FormProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface FormValues {
  title: string;
  description: string;
  status: string;
  priority: number;
  dueDate: any;
}

const BasicFormTemplate: React.FC = () => {
  const [form] = Form.useForm<FormValues>();

  const onFinish: FormProps<FormValues>['onFinish'] = (values) => {
    console.log('Form values:', values);
    // Handle form submission
  };

  const onFinishFailed: FormProps<FormValues>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <Form
      form={form}
      name="basic-form"
      layout="vertical"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      initialValues={{
        status: 'pending',
        priority: 1,
      }}
    >
      <Form.Item
        label="Title"
        name="title"
        rules={[
          { required: true, message: 'Please input the title!' },
          { min: 3, message: 'Title must be at least 3 characters!' },
        ]}
      >
        <Input placeholder="Enter title" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[
          { required: true, message: 'Please input the description!' },
        ]}
      >
        <TextArea rows={4} placeholder="Enter description" />
      </Form.Item>

      <Form.Item
        label="Status"
        name="status"
        rules={[{ required: true, message: 'Please select status!' }]}
      >
        <Select placeholder="Select status">
          <Option value="pending">Pending</Option>
          <Option value="in-progress">In Progress</Option>
          <Option value="completed">Completed</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Priority"
        name="priority"
        rules={[{ required: true, message: 'Please select priority!' }]}
      >
        <InputNumber min={1} max={5} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="Due Date"
        name="dueDate"
        rules={[{ required: true, message: 'Please select due date!' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
          Submit
        </Button>
        <Button htmlType="button" onClick={onReset}>
          Reset
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BasicFormTemplate;
