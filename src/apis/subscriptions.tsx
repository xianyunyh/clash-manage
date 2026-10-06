import { Context } from "hono";
import { Env } from "../bindings";
import { Subscription, isValidUrl } from "./types";
import Layout from "../view/Layout";
import AddSubscriptionForm from "../view/AddSubscriptionForm";
import SubscriptionList from "../view/SubscriptionList";
import EditSubscriptionForm from "../view/EditSubscriptionForm";

// 订阅列表页面
export async function getSubscriptionListHandler(
  c: Context<{ Bindings: Env }>,
) {
  try {
    const subscriptionsList =
      (await fetchSubscriptions(c.env.CLASH_CONFIG_KV)) || [];
    return c.html(<SubscriptionList subscriptions={subscriptionsList} />);
  } catch (error) {
    console.error("获取订阅列表出错:", error);
    return c.html(
      <Layout>
        <div style={{ color: "red", marginBottom: "15px" }}>
          获取订阅列表时发生错误，请稍后重试 {error}
        </div>
        <a href="/">返回首页</a>
      </Layout>,
    );
  }
}

// 添加订阅页面路由
export function getAddSubscriptionHandler(c: Context<{ Bindings: Env }>) {
  return c.html(
    <Layout>
      <AddSubscriptionForm />
    </Layout>,
  );
}

export async function getEditSubscriptionView(c: Context<{ Bindings: Env }>) {
  const id = c.req.param("id");
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_CONFIG_KV.get(id);

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: "red", marginBottom: "15px" }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>,
      );
    }

    const subData = JSON.parse(subscription) as Subscription;

    return c.html(
      <EditSubscriptionForm
        subId={id}
        subName={subData.name}
        subUrl={subData.url}
      />,
    );
  } catch (error) {
    console.error("获取订阅信息出错:", error);
    return c.html(
      <Layout>
        <div style={{ color: "red", marginBottom: "15px" }}>
          获取订阅信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>,
    );
  }
}
// 处理订阅添加请求
export async function postAddSubscriptionHandler(
  c: Context<{ Bindings: Env }>,
) {
  try {
    const formData = await c.req.formData();
    const subUrl = formData.get("subUrl")?.toString();
    const name = formData.get("name")?.toString() || "未命名订阅";

    if (!subUrl || !isValidUrl(subUrl)) {
      return c.html(
        <Layout>
          <AddSubscriptionForm message="请提供有效的订阅链接" error={true} />
        </Layout>,
      );
    }

    // 生成唯一ID (使用 UUID v4)
    const id = crypto.randomUUID();

    // 存储订阅信息到KV中
    await c.env.CLASH_CONFIG_KV.put(
      id,
      JSON.stringify({
        url: subUrl,
        name: name,
        createdAt: new Date().toISOString(),
        rules: [],
      }),
    );

    // 构建访问URL
    const baseUrl = new URL(c.req.url).origin;
    const accessUrl = `${baseUrl}/clash/${id}`;

    return c.html(
      <Layout>
        <AddSubscriptionForm
          message={`订阅添加成功！您可以通过以下链接访问处理后的配置：`}
        />
        <div
          style={{
            margin: "20px 0",
            padding: "15px",
            background: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          <p>
            <strong>订阅ID:</strong> {id}
          </p>
          <p>
            <strong>访问链接:</strong> <a href={accessUrl}>{accessUrl}</a>
          </p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            将此链接添加到您的 Clash 客户端即可使用自定义配置
          </p>
        </div>
        <div style={{ marginTop: "20px" }}>
          <a
            href="/subscriptions"
            style={{
              display: "inline-block",
              background: "#2196F3",
              color: "white",
              padding: "10px 15px",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            查看订阅列表
          </a>
        </div>
      </Layout>,
    );
  } catch (error) {
    console.error("添加订阅出错:", error);
    return c.html(
      <Layout>
        <AddSubscriptionForm
          message="添加订阅时发生错误，请稍后重试"
          error={true}
        />
      </Layout>,
    );
  }
}
export async function getDeleteSubscriptionView(c: Context<{ Bindings: Env }>) {
  const id = c.req.param("id");
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_CONFIG_KV.get(id);

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: "red", marginBottom: "15px" }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>,
      );
    }

    const subData = JSON.parse(subscription) as Subscription;

    return c.html(
      <Layout>
        <h1>删除订阅</h1>
        <div style={{ marginBottom: "20px" }}>
          <p>您确定要删除以下订阅吗？此操作不可撤销。</p>
          <div
            style={{
              padding: "15px",
              background: "#f5f5f5",
              borderRadius: "4px",
              marginTop: "10px",
            }}
          >
            <p>
              <strong>订阅名称:</strong> {subData.name}
            </p>
            <p>
              <strong>订阅链接:</strong> {subData.url}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <form
            method="post"
            action={`/subscription/delete/${id}`}
            style={{ flexGrow: 1 }}
          >
            <button
              type="submit"
              style={{
                background: "#f44336",
                border: "none",
                color: "white",
                padding: "10px 15px",
                cursor: "pointer",
                borderRadius: "4px",
                width: "100%",
              }}
            >
              确认删除
            </button>
          </form>
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>,
    );
  } catch (error) {
    console.error("获取订阅信息出错:", error);
    return c.html(
      <Layout>
        <div style={{ color: "red", marginBottom: "15px" }}>
          获取订阅信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>,
    );
  }
}
// 删除订阅页面
export async function getDeleteSubscriptionHandler(
  c: Context<{ Bindings: Env }>,
) {
  const id = c.req.param("id");
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_CONFIG_KV.get(id);

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: "red", marginBottom: "15px" }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>,
      );
    }

    const subData = JSON.parse(subscription) as Subscription;

    return c.html(
      <Layout>
        <h1>删除订阅</h1>
        <div style={{ marginBottom: "20px" }}>
          <p>您确定要删除以下订阅吗？此操作不可撤销。</p>
          <div
            style={{
              padding: "15px",
              background: "#f5f5f5",
              borderRadius: "4px",
              marginTop: "10px",
            }}
          >
            <p>
              <strong>订阅名称:</strong> {subData.name}
            </p>
            <p>
              <strong>订阅链接:</strong> {subData.url}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <form
            method="post"
            action={`/subscription/delete/${id}`}
            style={{ flexGrow: 1 }}
          >
            <button
              type="submit"
              style={{
                background: "#f44336",
                border: "none",
                color: "white",
                padding: "10px 15px",
                cursor: "pointer",
                borderRadius: "4px",
                width: "100%",
              }}
            >
              确认删除
            </button>
          </form>
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>,
    );
  } catch (error) {
    console.error("获取订阅信息出错:", error);
    return c.html(
      <Layout>
        <div style={{ color: "red", marginBottom: "15px" }}>
          获取订阅信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>,
    );
  }
}

// 处理删除订阅请求
export async function postDeleteSubscriptionHandler(
  c: Context<{ Bindings: Env }>,
) {
  const id = c.req.param("id");
  try {
    await c.env.CLASH_CONFIG_KV.delete(id);
    return c.html(
      <Layout>
        <div
          style={{
            color: "green",
            marginBottom: "15px",
            padding: "10px",
            background: "#e8f5e9",
            borderRadius: "4px",
          }}
        >
          订阅已成功删除
        </div>
        <a
          href="/subscriptions"
          style={{
            display: "inline-block",
            background: "#2196F3",
            color: "white",
            padding: "10px 15px",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          返回订阅列表
        </a>
      </Layout>,
    );
  } catch (error) {
    console.error("删除订阅出错:", error);
    return c.html(
      <Layout>
        <div style={{ color: "red", marginBottom: "15px" }}>
          删除订阅时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>,
    );
  }
}

// 编辑订阅页面
export async function getEditSubscriptionHandler(
  c: Context<{ Bindings: Env }>,
) {
  const id = c.req.param("id");
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_CONFIG_KV.get(id);

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: "red", marginBottom: "15px" }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>,
      );
    }

    const subData = JSON.parse(subscription) as Subscription;

    return c.html(
      <EditSubscriptionForm
        subId={id}
        subName={subData.name}
        subUrl={subData.url}
      />,
    );
  } catch (error) {
    console.error("获取订阅信息出错:", error);
    return c.html(
      <Layout>
        <div style={{ color: "red", marginBottom: "15px" }}>
          获取订阅信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>,
    );
  }
}

// 处理编辑订阅请求
export async function postEditSubscriptionHandler(
  c: Context<{ Bindings: Env }>,
) {
  const id = c.req.param("id");
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_CONFIG_KV.get(id);

    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: "red", marginBottom: "15px" }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>,
      );
    }

    const subData = JSON.parse(subscription) as Subscription;

    const formData = await c.req.formData();
    const subUrl = formData.get("subUrl")?.toString();
    const name = formData.get("name")?.toString();

    if (!subUrl || !isValidUrl(subUrl)) {
      return c.html(
        <EditSubscriptionForm
          subId={id}
          subName={subData.name}
          subUrl={subData.url}
          message="请提供有效的订阅链接"
          error={true}
        />,
      );
    }

    if (!name) {
      return c.html(
        <EditSubscriptionForm
          subId={id}
          subName={subData.name}
          subUrl={subData.url}
          message="请提供订阅名称"
          error={true}
        />,
      );
    }

    // 更新订阅信息
    subData.url = subUrl;
    subData.name = name;

    // 保存到 KV
    await c.env.CLASH_CONFIG_KV.put(id, JSON.stringify(subData));

    return c.html(
      <Layout>
        <div
          style={{
            color: "green",
            marginBottom: "15px",
            padding: "10px",
            background: "#e8f5e9",
            borderRadius: "4px",
          }}
        >
          订阅信息已成功更新
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <a
            href={`/subscription/${id}/edit`}
            style={{
              background: "#ffc107",
              border: "none",
              color: "black",
              padding: "10px 15px",
              cursor: "pointer",
              borderRadius: "4px",
              textDecoration: "none",
              textAlign: "center",
              flexGrow: 1,
            }}
          >
            继续编辑
          </a>
          <a
            href="/subscriptions"
            style={{
              background: "#2196F3",
              border: "none",
              color: "white",
              padding: "10px 15px",
              cursor: "pointer",
              borderRadius: "4px",
              textDecoration: "none",
              textAlign: "center",
              flexGrow: 1,
            }}
          >
            返回订阅列表
          </a>
        </div>
      </Layout>,
    );
  } catch (error) {
    console.error("更新订阅信息出错:", error);
    return c.html(
      <Layout>
        <div style={{ color: "red", marginBottom: "15px" }}>
          更新订阅信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>,
    );
  }
}

// 处理 Clash 订阅请求
export async function getClashConfigHandler(c: Context<{ Bindings: Env }>) {
  const id = c.req.param("id");

  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_CONFIG_KV.get(id);

    if (!subscription) {
      return c.text("订阅不存在或已被删除", 404);
    }

    const subData = JSON.parse(subscription) as Subscription;

    // 获取原始订阅内容
    const response = await fetch(subData.url, {
      method: "GET",
      headers: {
        "User-Agent": "clash-verge/v2.4.7",
      },
    });
    if (!response.ok) {
      return c.text("获取原始订阅失败", 500);
    }

    // 获取订阅内容
    const originalConfig = await response.text();

    // 首先应用自定义规则
    let updatedConfig = applyCustomRules(originalConfig, subData.rules || []);

    // 然后添加自定义节点
    updatedConfig = applyCustomNodes(updatedConfig, subData.nodes || []);

    return c.text(updatedConfig, 200, {
      "Content-Type": "text/yaml; charset=utf-8",
    });
  } catch (error) {
    console.error("处理订阅出错:", error);
    return c.text("处理订阅时发生错误", 500);
  }
}

// 辅助函数：应用自定义规则到配置中
export function applyCustomRules(
  originalConfig: string,
  rules: Subscription["rules"],
): string {
  if (!rules || rules.length === 0) return originalConfig;

  // 简单的字符串处理方法，实际环境可能需要使用 YAML 解析库
  let config = originalConfig;

  // 定位规则部分，找到 rules: 定义的位置
  const rulesIndex = config.indexOf("\nrules:");

  if (rulesIndex === -1) {
    // 如果没有找到规则部分，添加一个新的规则部分
    config += "\nrules:";

    // 添加自定义规则
    for (const rule of rules) {
      config += `\n  - ${rule.type},${rule.content},${rule.policy}`;
    }
  } else {
    // 找到规则部分，在其中插入自定义规则
    let rulesEndIndex = rulesIndex + 7; // 'rules:' 的长度

    // 用户规则应该添加在开头（优先级更高）
    let rulesInsertPos = config.indexOf("\n", rulesEndIndex);
    if (rulesInsertPos === -1) rulesInsertPos = config.length;

    let customRulesText = "";
    for (const rule of rules) {
      customRulesText += `\n  - ${rule.type},${rule.content},${rule.policy}`;
    }

    config =
      config.substring(0, rulesInsertPos) +
      customRulesText +
      config.substring(rulesInsertPos);
  }

  return config;
}

// 辅助函数：应用自定义节点到配置中
export function applyCustomNodes(
  originalConfig: string,
  nodes: Subscription["nodes"],
): string {
  if (!nodes || nodes.length === 0) return originalConfig;

  // 简单的字符串处理方法，实际环境可能需要使用 YAML 解析库
  let config = originalConfig;

  // 定位节点部分，找到 proxies: 定义的位置
  const proxiesIndex = config.indexOf("\nproxies:");

  if (proxiesIndex === -1) {
    // 如果没有找到节点部分，添加一个新的节点部分
    config += "\nproxies:";

    // 添加自定义节点
    for (const node of nodes) {
      config += `\n  - name: ${node.name}`;
      config += `\n    type: ${node.type}`;
      config += `\n    server: ${node.server}`;
      config += `\n    port: ${node.port}`;
      if (node.password) config += `\n    password: ${node.password}`;
      if (node.uuid) config += `\n    uuid: ${node.uuid}`;
      if (node.cipher) config += `\n    cipher: ${node.cipher}`;
      if (node.tls) config += `\n    tls: ${node.tls}`;
      if (node.skip_cert_verify)
        config += `\n    skip-cert-verify: ${node.skip_cert_verify}`;
      if (node.servername) config += `\n    servername: ${node.servername}`;
      if (node.network) config += `\n    network: ${node.network}`;
      if (node.ws_path) config += `\n    ws-path: ${node.ws_path}`;
      if (node.udp) config += `\n    udp: ${node.udp}`;
      if (node.grpc_service_name)
        config += `\n    grpc-service-name: ${node.grpc_service_name}`;
    }
  } else {
    // 找到节点部分，在其中插入自定义节点
    let proxiesEndIndex = proxiesIndex + 9; // 'proxies:' 的长度

    // 用户节点应该添加在开头（优先级更高）
    let proxiesInsertPos = config.indexOf("\n", proxiesEndIndex);
    if (proxiesInsertPos === -1) proxiesInsertPos = config.length;

    let customNodesText = "";
    for (const node of nodes) {
      customNodesText += `\n  - name: ${node.name}`;
      customNodesText += `\n    type: ${node.type}`;
      customNodesText += `\n    server: ${node.server}`;
      customNodesText += `\n    port: ${node.port}`;
      if (node.password) customNodesText += `\n    password: ${node.password}`;
      if (node.uuid) customNodesText += `\n    uuid: ${node.uuid}`;
      if (node.cipher) customNodesText += `\n    cipher: ${node.cipher}`;
      if (node.tls) customNodesText += `\n    tls: ${node.tls}`;
      if (node.skip_cert_verify)
        customNodesText += `\n    skip-cert-verify: ${node.skip_cert_verify}`;
      if (node.servername)
        customNodesText += `\n    servername: ${node.servername}`;
      if (node.network) customNodesText += `\n    network: ${node.network}`;
      if (node.ws_path) customNodesText += `\n    ws-path: ${node.ws_path}`;
      if (node.udp) customNodesText += `\n    udp: ${node.udp}`;
      if (node.grpc_service_name)
        customNodesText += `\n    grpc-service-name: ${node.grpc_service_name}`;
    }

    config =
      config.substring(0, proxiesInsertPos) +
      customNodesText +
      config.substring(proxiesInsertPos);
  }

  return config;
}

// 列出所有订阅
async function fetchSubscriptions(kv: KVNamespace): Promise<Subscription[]> {
  const list = await kv.list();
  const subscriptions: Subscription[] = [];
  for (const key of list.keys) {
    const value = await kv.get(key.name);
    // kv.delete(key.name);
    if (value) {
      try {
        const sub = JSON.parse(value) as Subscription;
        sub.id = key.name;

        subscriptions.push(sub);
      } catch (error) {
        console.log(error);
      }
    }
  }

  return subscriptions;
}
