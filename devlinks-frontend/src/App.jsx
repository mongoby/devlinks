import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography, Avatar, Dropdown, Space } from 'antd'
import {
  DashboardOutlined,
  LinkOutlined,
  BookOutlined,
  ApiOutlined,
  ToolOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { useState } from 'react'
import { useAuth } from './hooks/useAuth.js'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Links from './pages/Links.jsx'
import TIL from './pages/TIL.jsx'
import MockAPI from './pages/MockAPI.jsx'
import Tools from './pages/Tools.jsx'

const { Header, Content, Sider } = Layout
const { Title } = Typography

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa'
      }}>
        <Title level={4}>加载中...</Title>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return children
}

const AppLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/links',
      icon: <LinkOutlined />,
      label: '链接管理',
    },
    {
      key: '/til',
      icon: <BookOutlined />,
      label: 'TIL知识墙',
    },
    {
      key: '/mock',
      icon: <ApiOutlined />,
      label: 'Mock API',
    },
    {
      key: '/tools',
      icon: <ToolOutlined />,
      label: '开发者工具',
    },
  ]

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      }
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={240}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
          <Title level={3} style={{ color: '#fff', margin: 0, textAlign: 'center' }}>
            DevLinks
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Title level={4} style={{ margin: 0 }}>开发者工具集</Title>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.username || '用户'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f5f7fa', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/links" element={<Links />} />
                <Route path="/til" element={<TIL />} />
                <Route path="/mock" element={<MockAPI />} />
                <Route path="/tools" element={<Tools />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
