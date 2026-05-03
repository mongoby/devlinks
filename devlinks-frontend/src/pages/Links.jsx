import { useEffect, useState } from 'react'
import { Card, Button, Input, Tag, message, Modal, Form, Typography, Space, Empty, Table, Select, Drawer, Popconfirm, Popover } from 'antd'
import { LinkOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined, SettingOutlined } from '@ant-design/icons'
import { linkService } from '../services/link.js'
import { categoryService } from '../services/category.js'

const { Title, Text } = Typography

const Links = () => {
  const [links, setLinks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categorySaving, setCategorySaving] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [categoryDrawerVisible, setCategoryDrawerVisible] = useState(false)
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm] = Form.useForm()
  const [filterEnvironment, setFilterEnvironment] = useState('all')
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [searchValue, setSearchValue] = useState('')
  const [categoryValue, setCategoryValue] = useState(null)
  const [environmentValue, setEnvironmentValue] = useState('all')
  const [checkingLinks, setCheckingLinks] = useState(false)

  const environmentOptions = [
    { value: 'dev', label: '开发', color: 'blue' },
    { value: 'test', label: '测试', color: 'green' },
    { value: 'pre', label: '预发布', color: 'orange' },
    { value: 'pro', label: '生产', color: 'red' }
  ]

  const statusOptions = {
    active: { label: '正常', color: 'success' },
    inactive: { label: '失效', color: 'error' },
    archived: { label: '归档', color: 'default' }
  }

  useEffect(() => {
    loadLinks()
    loadCategories()
  }, [])

  const handleSearch = () => {
    setSearchText(searchValue)
    setFilterCategory(categoryValue)
    setFilterEnvironment(environmentValue)
    setPagination(prev => ({ ...prev, current: 1 }))
    // 直接调用 loadLinks，使用新的筛选值
    loadLinks(1, pagination.pageSize, searchValue, categoryValue, environmentValue)
  }

  const handleReset = () => {
    setSearchValue('')
    setCategoryValue(null)
    setEnvironmentValue('all')
    setSearchText('')
    setFilterCategory(null)
    setFilterEnvironment('all')
    setPagination(prev => ({ ...prev, current: 1 }))
    // 重置后重新加载数据
    loadLinks(1, pagination.pageSize, '', null, 'all')
  }

  const loadLinks = async (page = 1, pageSize = 10, search = searchText, category = filterCategory, env = filterEnvironment) => {
    try {
      setLoading(true)
      const params = { page, page_size: pageSize }
      if (search) params.search = search
      if (category) params.category_id = category
      if (env && env !== 'all') params.environment = env
      const data = await linkService.getLinks(params)
      if (data && typeof data === 'object') {
        if (data.data && typeof data.data === 'object') {
          setLinks(data.data.items || data.data.data || [])
          setPagination(prev => ({
            ...prev,
            current: data.data.page || page,
            total: data.data.total || 0
          }))
        } else if (data.items) {
          setLinks(data.items)
          setPagination(prev => ({
            ...prev,
            current: data.page || page,
            total: data.total || 0
          }))
        } else {
          setLinks([])
        }
      } else {
        setLinks([])
      }
    } catch (error) {
      message.error('加载链接失败')
      setLinks([])
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories()
      if (Array.isArray(data)) {
        setCategories(data)
      } else if (data && typeof data === 'object') {
        const items = data.data || data.categories || data.items || []
        setCategories(items)
      } else {
        setCategories([])
      }
    } catch (error) {
      message.error('加载分类失败')
      setCategories([])
    }
  }

  const handleAdd = () => {
    setEditingLink(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (link) => {
    setEditingLink(link)
    form.setFieldsValue({
      ...link,
      tags: Array.isArray(link.tags) ? link.tags.join(', ') : link.tags
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个链接吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await linkService.deleteLink(id.toString())
          message.success('删除成功')
          // 删除后重新加载当前页数据
          const data = await linkService.getLinks({ page: pagination.current, page_size: pagination.pageSize })
          const items = data?.data?.items || data?.data?.data || data?.items || []
          // 如果当前页没有数据且不是第一页，跳转到上一页
          if (items.length === 0 && pagination.current > 1) {
            loadLinks(pagination.current - 1, pagination.pageSize)
          } else {
            // 直接更新状态，避免重复请求
            if (data && typeof data === 'object') {
              if (data.data && typeof data.data === 'object') {
                setLinks(data.data.items || data.data.data || [])
                setPagination(prev => ({
                  ...prev,
                  current: data.data.page || pagination.current,
                  total: data.data.total || 0
                }))
              } else if (data.items) {
                setLinks(data.items)
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

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的链接')
      return
    }
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个链接吗？`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await linkService.batchDeleteLinks(selectedRowKeys)
          message.success(`成功删除 ${selectedRowKeys.length} 个链接`)
          setSelectedRowKeys([])
          loadLinks(pagination.current, pagination.pageSize)
        } catch (error) {
          message.error('批量删除失败')
        }
      }
    })
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    categoryForm.resetFields()
    setCategoryModalVisible(true)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    categoryForm.setFieldsValue(category)
    setCategoryModalVisible(true)
  }

  const handleDeleteCategory = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除分类后，该分类下的链接将变为未分类。确定要删除吗？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await categoryService.deleteCategory(id.toString())
          message.success('删除分类成功')
          loadCategories()
        } catch (error) {
          if (error.response?.status === 400) {
            message.error('该分类下有关联链接，无法删除')
          } else {
            message.error('删除分类失败')
          }
        }
      }
    })
  }

  const handleCategorySubmit = async () => {
    try {
      setCategorySaving(true)
      const values = await categoryForm.validateFields()
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id.toString(), values)
        message.success('更新分类成功')
      } else {
        await categoryService.createCategory(values)
        message.success('创建分类成功')
      }
      setCategoryModalVisible(false)
      loadCategories()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setCategorySaving(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      const values = await form.validateFields()
      const submitData = {
        ...values,
        tags: typeof values.tags === 'string' ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : values.tags
      }
      if (editingLink) {
        await linkService.updateLink(editingLink.id.toString(), submitData)
        message.success('更新成功')
      } else {
        await linkService.createLink(submitData)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadLinks(pagination.current, pagination.pageSize)
    } catch (error) {
      message.error('操作失败')
    } finally {
      setSaving(false)
    }
  }

  const handleTableChange = (newPagination) => {
    loadLinks(newPagination.current, newPagination.pageSize)
  }

  const handleCheckLinks = async () => {
    try {
      setCheckingLinks(true)
      message.loading('正在检测链接有效性...', 0)
      await linkService.checkLinks()
      message.destroy()
      message.success('检测完成')
      loadLinks(pagination.current, pagination.pageSize)
    } catch (error) {
      message.destroy()
      message.error('检测失败')
    } finally {
      setCheckingLinks(false)
    }
  }

  const getCategoryName = (categoryId) => {
    const category = (Array.isArray(categories) ? categories : []).find(c => c.id === categoryId)
    return category ? category.name : '未分类'
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => {
        const titleContent = (
          <Space>
            {record.favicon && (
              <img
                src={record.favicon}
                alt=""
                style={{ width: 16, height: 16, objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            )}
            <a href={record.url} target="_blank" rel="noopener noreferrer">{text}</a>
          </Space>
        )
        if (record.preview_image) {
          return (
            <Popover
              content={<img src={record.preview_image} alt={text} style={{ maxWidth: 300, maxHeight: 200, objectFit: 'contain' }} />}
              title="网站预览"
              trigger="hover"
            >
              {titleContent}
            </Popover>
          )
        }
        return titleContent
      }
    },
    {
      title: '环境',
      dataIndex: 'environment',
      key: 'environment',
      width: 80,
      render: (env) => {
        const option = environmentOptions.find(opt => opt.value === env)
        return option ? <Tag color={option.color}>{option.label}</Tag> : '-'
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const option = statusOptions[status]
        return option ? <Tag color={option.color}>{option.label}</Tag> : '-'
      }
    },
    {
      title: '分类',
      dataIndex: 'category_id',
      key: 'category_id',
      width: 100,
      render: (id) => <Tag>{getCategoryName(id)}</Tag>
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (text) => (
        <Text type="secondary" ellipsis={{ tooltip: text }}>{text}</Text>
      )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 180,
      render: (tags) => (
        tags && tags.length > 0 ? (
          <Space wrap>
            {tags.map((tag, index) => (
              <Tag key={index} color="blue">{tag}</Tag>
            ))}
          </Space>
        ) : '-'
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(Number(record.id))} />
        </Space>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    getCheckboxProps: (record) => ({
      disabled: false,
      name: record.title,
    }),
  }

  return (
    <div style={{ padding: '8px 0' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>链接管理</Title>
            <Text type="secondary">管理您的开发资源链接</Text>
          </div>
          <Space>
            <Button icon={<LinkOutlined />} onClick={handleCheckLinks} loading={checkingLinks}>
              检测失效链接
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加链接
            </Button>
          </Space>
        </div>

        <Card>
          <Space wrap>
            <Input
              placeholder="搜索链接标题、描述或URL..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
            <Select
              placeholder="筛选分类"
              prefix={<FilterOutlined />}
              style={{ width: 200 }}
              value={categoryValue}
              onChange={setCategoryValue}
              allowClear
            >
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
            <Select
              placeholder="筛选环境"
              prefix={<FilterOutlined />}
              style={{ width: 150 }}
              value={environmentValue}
              onChange={setEnvironmentValue}
              allowClear
            >
              <Select.Option value="all">全部环境</Select.Option>
              {environmentOptions.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
              ))}
            </Select>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
            <Button icon={<FilterOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button icon={<SettingOutlined />} onClick={() => setCategoryDrawerVisible(true)}>
              管理分类
            </Button>
            <Text type="secondary">共 {pagination.total} 条记录</Text>
          </Space>
        </Card>

        <Card>
          {links.length === 0 ? (
            <Empty description={searchText || filterCategory ? '未找到匹配的链接' : '暂无链接，点击上方按钮添加'} />
          ) : (
            <Table
              columns={columns}
              dataSource={links}
              loading={loading}
              rowKey="id"
              rowSelection={rowSelection}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              onChange={handleTableChange}
            />
          )}
        </Card>
      </Space>

      <Modal
        title={editingLink ? '编辑链接' : '添加链接'}
        open={modalVisible}
        onOk={handleSubmit}
        confirmLoading={saving}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入链接标题" />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: '请输入URL' },
              { type: 'url', message: '请输入有效的URL' }
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item name="category_id" label="分类">
            <Select placeholder="请选择分类" allowClear>
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="environment" label="环境">
            <Select placeholder="请选择环境">
              {environmentOptions.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入链接描述" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签用逗号分隔，如：前端, 框架, JavaScript" />
          </Form.Item>
          <Form.Item name="favicon" label="网站图标">
            <Input placeholder="https://example.com/favicon.ico" />
          </Form.Item>
          <Form.Item name="preview_image" label="预览图片">
            <Input placeholder="https://example.com/preview.png" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="分类管理"
        placement="right"
        width={400}
        open={categoryDrawerVisible}
        onClose={() => setCategoryDrawerVisible(false)}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
            新增分类
          </Button>
        }
      >
        {categories.length === 0 ? (
          <Empty description="暂无分类" />
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {categories.map(cat => (
              <Card key={cat.id} size="small" style={{ borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Tag color="blue">{cat.name}</Tag>
                    {cat.parent_id && <Text type="secondary">（子分类）</Text>}
                  </Space>
                  <Space size="small">
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditCategory(cat)} />
                    <Popconfirm
                      title="确认删除"
                      description="删除分类后，该分类下的链接将变为未分类"
                      onConfirm={() => handleDeleteCategory(cat.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            ))}
          </Space>
        )}
      </Drawer>

      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={categoryModalVisible}
        onOk={handleCategorySubmit}
        confirmLoading={categorySaving}
        onCancel={() => setCategoryModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={categoryForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="parent_id" label="父分类">
            <Select placeholder="请选择父分类（可选）" allowClear>
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sort" label="排序权重">
            <Input type="number" placeholder="数字越大越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Links
