import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Statistic, Row, Col, Typography, Space } from 'antd'
import {
  LinkOutlined,
  BookOutlined,
  ArrowUpOutlined
} from '@ant-design/icons'
import { linkService } from '../services/link.js'
import { tilService } from '../services/til.js'

const { Title, Text } = Typography

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    linkCount: 0,
    tilCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [links, tils] = await Promise.all([
        linkService.getLinks(),
        tilService.getTILs()
      ])
      setStats({
        linkCount: links?.data?.total || links?.total || 0,
        tilCount: tils?.data?.total || tils?.total || 0
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '8px 0' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>欢迎使用 DevLinks</Title>
          <Text type="secondary">开发者工具集 - 一站式开发资源管理平台</Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Card
              loading={loading}
              hoverable
              style={{ borderRadius: 8 }}
            >
              <Statistic
                title={
                  <Space>
                    <LinkOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                    <span>链接总数</span>
                  </Space>
                }
                value={stats.linkCount}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card
              loading={loading}
              hoverable
              style={{ borderRadius: 8 }}
            >
              <Statistic
                title={
                  <Space>
                    <BookOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                    <span>TIL知识</span>
                  </Space>
                }
                value={stats.tilCount}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="快速开始" style={{ borderRadius: 8 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card
                size="small"
                hoverable
                onClick={() => navigate('/links')}
                style={{ cursor: 'pointer' }}
              >
                <Title level={5}>链接管理</Title>
                <Text type="secondary">管理您的开发资源链接，支持分类和标签</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                size="small"
                hoverable
                onClick={() => navigate('/til')}
                style={{ cursor: 'pointer' }}
              >
                <Title level={5}>TIL知识墙</Title>
                <Text type="secondary">记录和分享您今天学到的新知识</Text>
              </Card>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  )
}

export default Dashboard
