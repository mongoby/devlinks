import { useState, useEffect } from 'react'
import { Card, Input, Button, Typography, Space, Row, Col, message, Tabs } from 'antd'
import {
  CodeOutlined,
  ClockCircleOutlined,
  FormatPainterOutlined,
  CopyOutlined,
  SwapOutlined
} from '@ant-design/icons'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const { Title, Text } = Typography
const TextArea = Input.TextArea

const Tools = () => {
  const [base64Input, setBase64Input] = useState('')
  const [base64Output, setBase64Output] = useState('')
  const [timestampInput, setTimestampInput] = useState('')
  const [timestampOutput, setTimestampOutput] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleBase64Encode = () => {
    try {
      setBase64Output(btoa(unescape(encodeURIComponent(base64Input))))
      message.success('编码成功')
    } catch (e) {
      message.error('编码失败')
    }
  }

  const handleBase64Decode = () => {
    try {
      setBase64Output(decodeURIComponent(escape(atob(base64Input))))
      message.success('解码成功')
    } catch (e) {
      message.error('解码失败，请检查输入')
    }
  }

  const handleTimestampToDate = () => {
    try {
      const date = new Date(parseInt(timestampInput) * 1000)
      setTimestampOutput(date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))
      message.success('转换成功')
    } catch (e) {
      message.error('转换失败，请检查时间戳')
    }
  }

  const handleDateToTimestamp = () => {
    try {
      const timestamp = Math.floor(new Date(timestampInput).getTime() / 1000)
      setTimestampOutput(timestamp.toString())
      message.success('转换成功')
    } catch (e) {
      message.error('转换失败，请检查日期格式')
    }
  }

  const handleJsonFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonOutput(JSON.stringify(parsed, null, 2))
      message.success('格式化成功')
    } catch (e) {
      message.error('JSON格式错误')
    }
  }

  const handleJsonMinify = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonOutput(JSON.stringify(parsed))
      message.success('压缩成功')
    } catch (e) {
      message.error('JSON格式错误')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  }

  const toolItems = [
    {
      key: 'base64',
      label: (
        <Space>
          <CodeOutlined />
          <span>Base64工具</span>
        </Space>
      ),
      children: (
        <Card style={{ borderRadius: 8 }}>
          <Row gutter={24}>
            <Col span={12}>
              <Text strong>输入</Text>
              <TextArea
                rows={8}
                placeholder="输入要编码/解码的文本"
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </Col>
            <Col span={12}>
              <Text strong>输出</Text>
              <TextArea
                rows={8}
                placeholder="结果将显示在这里"
                value={base64Output}
                readOnly
                style={{ marginTop: 8 }}
              />
              {base64Output && (
                <Button
                  type="link"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(base64Output)}
                  style={{ marginTop: 8 }}
                >
                  复制结果
                </Button>
              )}
            </Col>
          </Row>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Space>
              <Button type="primary" icon={<SwapOutlined />} onClick={handleBase64Encode}>
                Base64编码
              </Button>
              <Button icon={<SwapOutlined />} onClick={handleBase64Decode}>
                Base64解码
              </Button>
            </Space>
          </div>
        </Card>
      ),
    },
    {
      key: 'timestamp',
      label: (
        <Space>
          <ClockCircleOutlined />
          <span>时间戳工具</span>
        </Space>
      ),
      children: (
        <Card style={{ borderRadius: 8 }}>
          <div style={{ textAlign: 'center', marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <Text type="secondary">当前时间戳</Text>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff', marginTop: 8 }}>
              {currentTimestamp}
            </div>
          </div>
          <Row gutter={24}>
            <Col span={12}>
              <Text strong>输入</Text>
              <Input
                size="large"
                placeholder="输入时间戳或日期 (如: 2024-01-01 或 1704067200)"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </Col>
            <Col span={12}>
              <Text strong>输出</Text>
              <Input
                size="large"
                placeholder="结果将显示在这里"
                value={timestampOutput}
                readOnly
                style={{ marginTop: 8 }}
              />
              {timestampOutput && (
                <Button
                  type="link"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(timestampOutput)}
                  style={{ marginTop: 8 }}
                >
                  复制结果
                </Button>
              )}
            </Col>
          </Row>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Space>
              <Button type="primary" icon={<SwapOutlined />} onClick={handleTimestampToDate}>
                时间戳转日期
              </Button>
              <Button icon={<SwapOutlined />} onClick={handleDateToTimestamp}>
                日期转时间戳
              </Button>
            </Space>
          </div>
        </Card>
      ),
    },
    {
      key: 'json',
      label: (
        <Space>
          <FormatPainterOutlined />
          <span>JSON格式化</span>
        </Space>
      ),
      children: (
        <Card style={{ borderRadius: 8 }}>
          <Row gutter={24}>
            <Col span={12}>
              <Text strong>输入</Text>
              <TextArea
                rows={12}
                placeholder="输入JSON数据"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                style={{ marginTop: 8, fontFamily: 'monospace' }}
              />
            </Col>
            <Col span={12}>
              <Text strong>输出</Text>
              {jsonOutput ? (
                <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden' }}>
                  <SyntaxHighlighter language="json" style={oneDark} customStyle={{ borderRadius: 8, maxHeight: 400, margin: 0 }}>
                    {jsonOutput}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <Input.TextArea
                  rows={12}
                  placeholder="格式化后的JSON"
                  readOnly
                  style={{ marginTop: 8, fontFamily: 'monospace' }}
                />
              )}
              {jsonOutput && (
                <Button
                  type="link"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(jsonOutput)}
                  style={{ marginTop: 8 }}
                >
                  复制结果
                </Button>
              )}
            </Col>
          </Row>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Space>
              <Button type="primary" icon={<FormatPainterOutlined />} onClick={handleJsonFormat}>
                格式化JSON
              </Button>
              <Button icon={<FormatPainterOutlined />} onClick={handleJsonMinify}>
                压缩JSON
              </Button>
            </Space>
          </div>
        </Card>
      ),
    },
  ]

  return (
    <div style={{ padding: '8px 0' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>开发者工具集</Title>
          <Text type="secondary">常用的开发辅助工具</Text>
        </div>

        <Tabs
          defaultActiveKey="base64"
          items={toolItems}
          size="large"
          type="card"
        />
      </Space>
    </div>
  )
}

export default Tools
