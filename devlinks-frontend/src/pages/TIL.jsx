import { useEffect, useState } from 'react'
import { Card, Button, Input, Tag, message, Modal, Form, Typography, Space, Empty, Select, Table } from 'antd'
import { BookOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { tilService } from '../services/til.js'
import { formatDateTime } from '../utils/date.js'

const { Title, Text } = Typography

const TILPage = () => {
  const [tils, setTils] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filterArchive, setFilterArchive] = useState('all')
  const [filterProject, setFilterProject] = useState('all')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTIL, setEditingTIL] = useState(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchValue, setSearchValue] = useState('')
  const [archiveValue, setArchiveValue] = useState('all')
  const [projectValue, setProjectValue] = useState('all')
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [detailTIL, setDetailTIL] = useState(null)

  const projectOptions = ['前端项目', '后端服务', '基础设施', '数据平台', '监控系统']

  useEffect(() => {
    loadTILs()
  }, [])

  const handleSearch = () => {
    setSearchText(searchValue)
    setFilterArchive(archiveValue)
    setFilterProject(projectValue)
    setPagination(prev => ({ ...prev, current: 1 }))
    loadTILs(1, pagination.pageSize, searchValue, archiveValue, projectValue)
  }

  const handleReset = () => {
    setSearchValue('')
    setArchiveValue('all')
    setProjectValue('all')
    setSearchText('')
    setFilterArchive('all')
    setFilterProject('all')
    setPagination(prev => ({ ...prev, current: 1 }))
    loadTILs(1, pagination.pageSize, '', 'all', 'all')
  }

  const loadTILs = async (page = 1, pageSize = 10, search = searchText, archive = filterArchive, project = filterProject) => {
    try {
      setLoading(true)
      const params = { page, page_size: pageSize }
      if (search) params.search = search
      if (archive && archive !== 'all') params.archive = archive
      if (project && project !== 'all') params.project = project
      const data = await tilService.getTILs(params)
      if (data && typeof data === 'object') {
        if (data.data && typeof data.data === 'object') {
          setTils(data.data.items || data.data.tils || data.data.data || [])
          setPagination(prev => ({
            ...prev,
            current: data.data.page || page,
            total: data.data.total || 0
          }))
        } else if (data.items) {
          setTils(data.items)
          setPagination(prev => ({
            ...prev,
            current: data.page || page,
            total: data.total || 0
          }))
        } else {
          setTils([])
        }
      } else {
        setTils([])
      }
    } catch (error) {
      message.error('加载TIL失败')
      setTils([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingTIL(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (til) => {
    setEditingTIL(til)
    form.setFieldsValue({
      ...til,
      tags: Array.isArray(til.tags) ? til.tags.join(', ') : til.tags
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条TIL吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await tilService.deleteTIL(id.toString())
          message.success('删除成功')
          // 删除后重新加载当前页数据
          const data = await tilService.getTILs({ page: pagination.current, page_size: pagination.pageSize })
          const items = data?.data?.items || data?.data?.tils || data?.data?.data || data?.items || []
          // 如果当前页没有数据且不是第一页，跳转到上一页
          if (items.length === 0 && pagination.current > 1) {
            loadTILs(pagination.current - 1, pagination.pageSize)
          } else {
            // 直接更新状态，避免重复请求
            if (data && typeof data === 'object') {
              if (data.data && typeof data.data === 'object') {
                setTils(data.data.items || data.data.tils || data.data.data || [])
                setPagination(prev => ({
                  ...prev,
                  current: data.data.page || pagination.current,
                  total: data.data.total || 0
                }))
              } else if (data.items) {
                setTils(data.items)
                setPagination(prev => ({
                  ...prev,
                  current: data.page || pagination.current,
                  total: data.total || 0
                }))
              }
            }
          }
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
        tags: typeof values.tags === 'string' ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : values.tags
      }
      if (editingTIL) {
        await tilService.updateTIL(editingTIL.id.toString(), submitData)
        message.success('更新成功')
      } else {
        await tilService.createTIL(submitData)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadTILs(pagination.current, pagination.pageSize)
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleTableChange = (newPagination) => {
    loadTILs(newPagination.current, newPagination.pageSize)
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
      width: 100,
      render: (project) => project ? <Tag color="purple">{project}</Tag> : '-'
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 120,
      render: (text, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setDetailTIL(record)
            setDetailModalVisible(true)
          }}
        >
          查看详情
        </Button>
      )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags) => (
        tags && tags.length > 0 ? (
          <Space wrap>
            {tags.map((tag, index) => (
              <Tag key={index} color="green">{tag}</Tag>
            ))}
          </Space>
        ) : '-'
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => formatDateTime(text)
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
            <Title level={3} style={{ margin: 0 }}>TIL知识墙</Title>
            <Text type="secondary">记录今天学到的新知识</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            发布TIL
          </Button>
        </div>

        <Card>
          <Space wrap>
            <Input
              placeholder="搜索TIL标题或标签..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
            <Select
              placeholder="按时间归档"
              prefix={<CalendarOutlined />}
              style={{ width: 150 }}
              value={archiveValue}
              onChange={setArchiveValue}
            >
              <Select.Option value="all">全部</Select.Option>
              <Select.Option value="today">今天</Select.Option>
              <Select.Option value="week">本周</Select.Option>
              <Select.Option value="month">本月</Select.Option>
            </Select>
            <Select
              placeholder="按项目筛选"
              style={{ width: 150 }}
              value={projectValue}
              onChange={setProjectValue}
            >
              <Select.Option value="all">全部项目</Select.Option>
              {projectOptions.map(p => (
                <Select.Option key={p} value={p}>{p}</Select.Option>
              ))}
            </Select>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
            <Button icon={<CalendarOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Text type="secondary">共 {pagination.total} 条记录</Text>
          </Space>
        </Card>

        <Card>
          {tils.length === 0 ? (
            <Empty description={searchText || filterArchive !== 'all' || filterProject !== 'all' ? '未找到匹配的TIL' : '暂无TIL，点击上方按钮发布'} />
          ) : (
            <Table
              columns={columns}
              dataSource={tils}
              loading={loading}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                pageSizeOptions: ['10', '20', '50']
              }}
              onChange={handleTableChange}
            />
          )}
        </Card>
      </Space>

      <Modal
        title={editingTIL ? '编辑TIL' : '发布TIL'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={800}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入TIL标题" />
          </Form.Item>
          <Form.Item name="project" label="所属项目">
            <Select placeholder="请选择项目">
              {projectOptions.map(p => (
                <Select.Option key={p} value={p}>{p}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="内容 (支持Markdown)"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea
              rows={10}
              placeholder="支持Markdown格式，例如：\n## 标题\n- 列表项\n**粗体**"
            />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={detailTIL ? detailTIL.title : 'TIL详情'}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setDetailTIL(null)
        }}
        footer={null}
        width={800}
      >
        {detailTIL && (
          <div style={{ maxHeight: 600, overflow: 'auto', padding: '8px 0' }}>
            <div style={{ marginBottom: 16 }}>
              {detailTIL.project && <Tag color="purple">{detailTIL.project}</Tag>}
              {detailTIL.tags && detailTIL.tags.length > 0 && detailTIL.tags.map((tag, i) => (
                <Tag key={i} color="green" style={{ marginLeft: 4 }}>{tag}</Tag>
              ))}
            </div>
            <ReactMarkdown
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>{children}</code>
                  )
                }
              }}
            >
              {detailTIL.content}
            </ReactMarkdown>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default TILPage
