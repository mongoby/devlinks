import { useEffect, useState } from 'react'
import { Card, Button, Table, Tag, message, Modal, Form, Input, Select, Typography, Space, Row, Col, Tabs } from 'antd'
import { ApiOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CodeOutlined, ThunderboltOutlined, FileTextOutlined, CopyOutlined } from '@ant-design/icons'
import { mockService } from '../services/mock.js'
import { formatDateTime } from '../utils/date.js'

const { Title, Text } = Typography
const TextArea = Input.TextArea

const MockAPI = () => {
  const [schemas, setSchemas] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [schemaModalVisible, setSchemaModalVisible] = useState(false)
  const [logsModalVisible, setLogsModalVisible] = useState(false)
  const [editingSchema, setEditingSchema] = useState(null)
  const [schemaInput, setSchemaInput] = useState('')
  const [generatedData, setGeneratedData] = useState('')
  const [projects, setProjects] = useState([])
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadSchemas()
    loadProjects()
  }, [])

  function extractArray(obj) {
    if (!obj) return []
    if (Array.isArray(obj)) return obj
    if (typeof obj === 'object') {
      // Backend returns {code, message, data: [...]} — data is the array
      if (obj.data && Array.isArray(obj.data)) return obj.data
      // Paginated response: {code, message, data: {items, total}}
      if (obj.data && obj.data.items && Array.isArray(obj.data.items)) return obj.data.items
      // Legacy: {items, total}
      if (obj.items && Array.isArray(obj.items)) return obj.items
    }
    return []
  }

  const loadSchemas = async () => {
    try {
      setLoading(true)
      const data = await mockService.getSchemas()
      setSchemas(extractArray(data))
    } catch (error) {
      message.error('加载Mock API失败')
      setSchemas([])
    } finally {
      setLoading(false)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await mockService.getProjects()
      setProjects(extractArray(data))
    } catch (error) {
      console.error('加载项目列表失败', error)
      setProjects([])
    }
  }

  const handleAdd = () => {
    setEditingSchema(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (schema) => {
    setEditingSchema(schema)
    form.setFieldsValue({
      ...schema,
      schema: typeof schema.schema === 'object' ? JSON.stringify(schema.schema, null, 2) : schema.schema
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个Mock API吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await mockService.deleteSchema(id.toString())
          message.success('删除成功')
          loadSchemas()
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        schema: typeof values.schema === 'string' ? JSON.parse(values.schema) : values.schema
      }
      if (editingSchema) {
        await mockService.updateSchema(editingSchema.id.toString(), submitData)
        message.success('更新成功')
      } else {
        await mockService.createSchema(submitData)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadSchemas()
    } catch (error) {
      if (error.message && error.message.includes('JSON')) {
        message.error('JSON Schema 格式错误，请检查')
      } else {
        message.error('操作失败')
      }
    }
  }

  const handleGenerateData = async () => {
    try {
      const schema = JSON.parse(schemaInput)
      const data = await mockService.generateMockData(schema)
      setGeneratedData(JSON.stringify(data, null, 2))
    } catch (error) {
      message.error('生成Mock数据失败，请检查Schema格式')
    }
  }

  const handleViewLogs = async () => {
    try {
      setLogsLoading(true)
      const data = await mockService.getLogs()
      setLogs(Array.isArray(data) ? data : data.data || [])
      setLogsModalVisible(true)
    } catch (error) {
      message.error('加载请求日志失败')
    } finally {
      setLogsLoading(false)
    }
  }

  const handleClearLogs = async () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有请求日志吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await mockService.clearLogs()
          message.success('清空日志成功')
          setLogs([])
        } catch (error) {
          message.error('清空日志失败')
        }
      }
    })
  }

  const columns = [
    {
      title: 'API路径',
      dataIndex: 'path',
      key: 'path',
      render: (text) => (
        <Space>
          <ApiOutlined style={{ color: '#722ed1' }} />
          <Text code>{text}</Text>
        </Space>
      )
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      render: (method) => {
        const color = method === 'GET' ? 'green' : method === 'POST' ? 'blue' : method === 'PUT' ? 'orange' : 'red'
        return <Tag color={color}>{method}</Tag>
      }
    },
    {
      title: '项目ID',
      dataIndex: 'project_id',
      key: 'project_id',
      render: (id) => <Tag>{id}</Tag>
    },
    {
      title: 'Mock 地址',
      key: 'mock_url',
      width: 300,
      render: (_, record) => {
        const project = projects.find(p => p.id === record.project_id)
        const projectName = project ? project.name : `project_${record.project_id}`
        const mockUrl = `http://localhost:8000/api/mock/run/${projectName}${record.path}`
        return (
          <Space>
            <Text code style={{ fontSize: 12, maxWidth: 220 }} ellipsis={{ tooltip: mockUrl }}>
              {mockUrl}
            </Text>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(mockUrl)
                message.success('已复制 Mock 地址')
              }}
            />
          </Space>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(Number(record.id))} />
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '8px 0' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Mock API工厂</Title>
            <Text type="secondary">快速创建和管理Mock接口</Text>
          </div>
          <Space>
            <Button icon={<FileTextOutlined />} onClick={handleViewLogs}>
              请求日志
            </Button>
            <Button icon={<ThunderboltOutlined />} onClick={() => setSchemaModalVisible(true)}>
              Schema生成器
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              创建Mock API
            </Button>
          </Space>
        </div>

        <Card title="Mock API列表" style={{ borderRadius: 8 }}>
          <Table
            columns={columns}
            dataSource={schemas}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Space>

      <Modal
        title={editingSchema ? '编辑Mock API' : '创建Mock API'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={700}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="project_id"
            label="所属项目"
            rules={[{ required: true, message: '请选择项目' }]}
          >
            <Select placeholder="请选择项目">
              {projects.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="path"
            label="API路径"
            rules={[{ required: true, message: '请输入API路径' }]}
          >
            <Input placeholder="/api/users" prefix={<ApiOutlined />} />
          </Form.Item>
          <Form.Item
            name="method"
            label="请求方法"
            rules={[{ required: true, message: '请选择请求方法' }]}
          >
            <Select placeholder="请选择请求方法">
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="schema"
            label="JSON Schema"
            rules={[{ required: true, message: '请输入JSON Schema' }]}
          >
            <TextArea
              rows={8}
              placeholder='{"type": "object", "properties": {"name": {"type": "string"}}}'
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <CodeOutlined />
            <span>Schema生成器</span>
          </Space>
        }
        open={schemaModalVisible}
        onCancel={() => setSchemaModalVisible(false)}
        footer={null}
        width={900}
      >
        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card size="small" title="输入JSON Schema">
              <TextArea
                rows={12}
                value={schemaInput}
                onChange={(e) => setSchemaInput(e.target.value)}
                placeholder='{"type": "object", "properties": {"name": {"type": "string"}, "age": {"type": "number"}}}'
                style={{ fontFamily: 'monospace' }}
              />
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleGenerateData}
                style={{ marginTop: 16 }}
                block
              >
                生成Mock数据
              </Button>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="生成的Mock数据">
              {generatedData ? (
                <TextArea
                  rows={12}
                  value={generatedData}
                  readOnly
                  style={{ fontFamily: 'monospace' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  点击左侧按钮生成Mock数据
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Modal>

      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>请求日志</span>
          </Space>
        }
        open={logsModalVisible}
        onCancel={() => setLogsModalVisible(false)}
        footer={
          <Space>
            <Button danger onClick={handleClearLogs} disabled={logs.length === 0}>
              清空日志
            </Button>
            <Button onClick={() => setLogsModalVisible(false)}>关闭</Button>
          </Space>
        }
        width={1000}
      >
        <Table
          dataSource={logs}
          loading={logsLoading}
          rowKey="id"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          columns={[
            {
              title: '时间',
              dataIndex: 'created_at',
              key: 'created_at',
              width: 180,
              render: (text) => formatDateTime(text)
            },
            {
              title: '方法',
              dataIndex: 'request_method',
              key: 'request_method',
              width: 100,
              render: (method) => {
                const color = method === 'GET' ? 'green' : method === 'POST' ? 'blue' : method === 'PUT' ? 'orange' : 'red'
                return <Tag color={color}>{method}</Tag>
              }
            },
            {
              title: '路径',
              dataIndex: 'request_path',
              key: 'request_path',
              render: (text) => <Text code>{text}</Text>
            },
            {
              title: '响应数据',
              dataIndex: 'response_data',
              key: 'response_data',
              width: 300,
              ellipsis: true,
              render: (text) => {
                if (!text) return '-'
                const str = typeof text === 'object' ? JSON.stringify(text) : String(text)
                return <Text code ellipsis={{ tooltip: str }}>{str.slice(0, 80)}</Text>
              }
            }
          ]}
        />
      </Modal>
    </div>
  )
}

export default MockAPI
