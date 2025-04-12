import Layout from "./Layout";

// 创建一个首页
export default function Home() {
  return (
    <Layout>
      <h1 style={{ textAlign: 'center' }}>欢迎使用 Clash 订阅管理系统</h1>
      <p style={{ textAlign: 'center' }}>请在左侧菜单中选择操作</p>
    </Layout>
  )
}