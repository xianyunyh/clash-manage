import { Context } from "hono"
import { Env } from "../bindings"
import { Layout, NodeForm, NodeList } from "../view"
import { Node, Subscription } from "./types"

export async function nodeListView(c: Context<{ Bindings: Env }>) {
  const id = c.req.param('id')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }

    const subData = JSON.parse(subscription) as Subscription

    return c.html(<NodeList
      subId={id}
      subName={subData.name}
      nodes={subData.nodes || []}
    />)
  } catch (error) {
    console.error('获取节点列表出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取节点列表时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }

}
export async function postAddNode(c: Context<{ Bindings: Env }>) {
  const id = c.req.param('id')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }

    const subData = JSON.parse(subscription) as Subscription

    const formData = await c.req.formData()

    // 获取基本字段
    const name = formData.get('name')?.toString()
    const type = formData.get('type')?.toString()
    const server = formData.get('server')?.toString()
    const portStr = formData.get('port')?.toString()

    // 验证必填字段
    if (!name || !type || !server || !portStr) {
      return c.html(
        <NodeForm
          subId={id}
          subName={subData.name}
          message="请填写所有必填字段"
          error={true}
        />
      )
    }

    const port = parseInt(portStr)
    if (isNaN(port) || port < 1 || port > 65535) {
      return c.html(
        <NodeForm
          subId={id}
          subName={subData.name}
          message="端口必须是1-65535之间的有效数字"
          error={true}
        />
      )
    }

    // 获取可选字段
    const password = formData.get('password')?.toString() || ''
    const uuid = formData.get('uuid')?.toString() || ''
    const cipher = formData.get('cipher')?.toString() || ''
    const tls = formData.get('tls') !== null
    const skip_cert_verify = formData.get('skip_cert_verify') !== null
    const servername = formData.get('servername')?.toString() || ''
    const network = formData.get('network')?.toString() || ''
    const ws_path = formData.get('ws_path')?.toString() || ''
    const udp = formData.get('udp') !== null
    const grpc_service_name = formData.get('grpc_service_name')?.toString() || ''

    // 创建节点对象
    const newNode: Node = {
      id: crypto.randomUUID(),
      name,
      type,
      server,
      port,
      password,
      uuid,
      cipher,
      tls,
      skip_cert_verify,
      servername,
      network,
      ws_path,
      udp,
      grpc_service_name,
      createdAt: new Date().toISOString()
    }

    // 添加节点到订阅
    if (!subData.nodes) {
      subData.nodes = []
    }

    subData.nodes.push(newNode)

    // 更新订阅数据
    await c.env.CLASH_SUBS.put(id, JSON.stringify(subData))

    return c.html(
      <Layout>
        <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
          节点添加成功
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={`/subscription/${id}/node/add`}
            style={{
              background: '#4CAF50',
              border: 'none',
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            继续添加节点
          </a>
          <a
            href={`/subscription/${id}/nodes`}
            style={{
              background: '#2196F3',
              border: 'none',
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            返回节点列表
          </a>
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('添加节点出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          添加节点时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
}

export async function addNodeView(c: Context<{ Bindings: Env }>) {
  const id = c.req.param('id')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }

    const subData = JSON.parse(subscription) as Subscription

    return c.html(<NodeForm subId={id} subName={subData.name} />)
  } catch (error) {
    console.error('获取订阅信息出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取订阅信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }

}
export async function editNodeView(c: Context<{ Bindings: Env }>) {
  const subId = c.req.param('subId')
  const nodeId = c.req.param('nodeId')

  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(subId)

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }

    const subData = JSON.parse(subscription) as Subscription

    // 查找要编辑的节点
    if (!subData.nodes) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            此订阅没有任何节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }

    const nodeToEdit = subData.nodes.find(node => node.id === nodeId)

    if (!nodeToEdit) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            未找到指定的节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }

    return c.html(
      <NodeForm
        subId={subId}
        subName={subData.name}
        isEdit={true}
        nodeId={nodeId}
        initialValues={nodeToEdit}
      />
    )
  } catch (error) {
    console.error('获取节点信息出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取节点信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }

}
export async function postEditNode(c: Context<{ Bindings: Env }>) {
  const subId = c.req.param('subId')
  const nodeId = c.req.param('nodeId')

  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(subId)

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }

    const subData = JSON.parse(subscription) as Subscription

    // 查找要编辑的节点
    if (!subData.nodes) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            此订阅没有任何节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }

    const nodeIndex = subData.nodes.findIndex(node => node.id === nodeId)

    if (nodeIndex === -1) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            未找到指定的节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }

    const formData = await c.req.formData()

    // 获取基本字段
    const name = formData.get('name')?.toString()
    const type = formData.get('type')?.toString()
    const server = formData.get('server')?.toString()
    const portStr = formData.get('port')?.toString()

    // 验证必填字段
    if (!name || !type || !server || !portStr) {
      return c.html(
        <NodeForm
          subId={subId}
          subName={subData.name}
          isEdit={true}
          nodeId={nodeId}
          initialValues={subData.nodes[nodeIndex]}
          message="请填写所有必填字段"
          error={true}
        />
      )
    }

    const port = parseInt(portStr)
    if (isNaN(port) || port < 1 || port > 65535) {
      return c.html(
        <NodeForm
          subId={subId}
          subName={subData.name}
          isEdit={true}
          nodeId={nodeId}
          initialValues={subData.nodes[nodeIndex]}
          message="端口必须是1-65535之间的有效数字"
          error={true}
        />
      )
    }

    // 获取可选字段
    const password = formData.get('password')?.toString() || ''
    const uuid = formData.get('uuid')?.toString() || ''
    const cipher = formData.get('cipher')?.toString() || ''
    const tls = formData.get('tls') !== null
    const skip_cert_verify = formData.get('skip_cert_verify') !== null
    const servername = formData.get('servername')?.toString() || ''
    const network = formData.get('network')?.toString() || ''
    const ws_path = formData.get('ws_path')?.toString() || ''
    const udp = formData.get('udp') !== null
    const grpc_service_name = formData.get('grpc_service_name')?.toString() || ''

    // 更新节点对象
    const updatedNode: Node = {
      ...subData.nodes[nodeIndex],
      name,
      type,
      server,
      port,
      password,
      uuid,
      cipher,
      tls,
      skip_cert_verify,
      servername,
      network,
      ws_path,
      udp,
      grpc_service_name
    }

    // 更新节点数组
    subData.nodes[nodeIndex] = updatedNode

    // 更新订阅数据
    await c.env.CLASH_SUBS.put(subId, JSON.stringify(subData))

    return c.html(
      <Layout>
        <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
          节点更新成功
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={`/subscription/${subId}/node/${nodeId}/edit`}
            style={{
              background: '#ffc107',
              border: 'none',
              color: 'black',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            继续编辑
          </a>
          <a
            href={`/subscription/${subId}/nodes`}
            style={{
              background: '#2196F3',
              border: 'none',
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            返回节点列表
          </a>
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('更新节点出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          更新节点时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
}

export async function deleteNodeView(c: Context<{ Bindings: Env }>) {
  const subId = c.req.param('subId')
  const nodeId = c.req.param('nodeId')

  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(subId)

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }

    const subData = JSON.parse(subscription) as Subscription

    // 查找要删除的节点
    if (!subData.nodes) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            此订阅没有任何节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }

    const nodeToDelete = subData.nodes.find(node => node.id === nodeId)

    if (!nodeToDelete) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            未找到指定的节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }

    return c.html(
      <Layout>
        <h1>删除节点</h1>
        <div style={{ marginBottom: '20px' }}>
          <p>您确定要删除以下节点吗？此操作不可撤销。</p>
          <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px', marginTop: '10px' }}>
            <p><strong>节点名称:</strong> {nodeToDelete.name}</p>
            <p><strong>节点类型:</strong> {nodeToDelete.type}</p>
            <p><strong>服务器地址:</strong> {nodeToDelete.server}</p>
            <p><strong>端口:</strong> {nodeToDelete.port}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <form method="post" action={`/subscription/${subId}/node/${nodeId}/delete`} style={{ flexGrow: 1 }}>
            <button
              type="submit"
              style={{
                background: '#f44336',
                border: 'none',
                color: 'white',
                padding: '10px 15px',
                cursor: 'pointer',
                borderRadius: '4px',
                width: '100%'
              }}
            >
              确认删除
            </button>
          </form>
          <a
            href={`/subscription/${subId}/nodes`}
            style={{
              background: '#9e9e9e',
              border: 'none',
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            取消
          </a>
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('获取节点信息出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取节点信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }

}
export async function deleteNode(c: Context<{ Bindings: Env }>) {
  const subId = c.req.param('subId')
  const nodeId = c.req.param('nodeId')

  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(subId)

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }

    const subData = JSON.parse(subscription) as Subscription

    // 删除节点
    if (!subData.nodes) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            此订阅没有任何节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }

    subData.nodes = subData.nodes.filter(node => node.id !== nodeId)

    // 更新订阅数据
    await c.env.CLASH_SUBS.put(subId, JSON.stringify(subData))

    return c.html(
      <Layout>
        <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
          节点已成功删除
        </div>
        <a
          href={`/subscription/${subId}/nodes`}
          style={{
            display: 'inline-block',
            background: '#2196F3',
            color: 'white',
            padding: '10px 15px',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          返回节点列表
        </a>
      </Layout>
    )
  } catch (error) {
    console.error('删除节点出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          删除节点时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
}