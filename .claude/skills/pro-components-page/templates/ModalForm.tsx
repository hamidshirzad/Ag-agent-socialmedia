import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import type { FormProps } from 'antd';

interface ModalFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (values: any) => void;
  initialValues?: any;
  title?: string;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
}

const ModalFormTemplate: React.FC<ModalFormProps> = ({
  open,
  onClose,
  onSuccess,
  initialValues,
  title = 'Form Modal',
}) => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success('Form submitted successfully!');
      onSuccess?.(values);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnClose
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please input name!' },
            { min: 2, message: 'Name must be at least 2 characters!' },
          ]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone"
          rules={[
            { required: true, message: 'Please input phone!' },
            { pattern: /^[0-9-+()]*$/, message: 'Please enter a valid phone number!' },
          ]}
        >
          <Input placeholder="Enter phone" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Example usage component
export const ModalFormExample: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleSuccess = (values: any) => {
    console.log('Form values:', values);
  };

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open Modal Form
      </Button>

      <ModalFormTemplate
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
        title="Create User"
      />
    </>
  );
};

export default ModalFormTemplate;
