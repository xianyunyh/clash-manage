import { FC } from "hono/jsx";
import Layout from "./Layout";

interface Subscription {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  rules?: {
    id: string;
    type: string;
    content: string;
  }[];
  nodes?: {
    id: string;
    name: string;
    type: string;
  }[];
}

const SubscriptionList: FC<{ subscriptions: Subscription[] }> = ({
  subscriptions,
}) => {
  return (
    <Layout>
      <h1>订阅管理</h1>
      {subscriptions.length === 0 ? (
        <div>
          <p>您还没有添加任何订阅</p>
          <a
            href="/subscription/add"
            style={{
              display: "inline-block",
              background: "#4CAF50",
              color: "white",
              padding: "10px 15px",
              textDecoration: "none",
              borderRadius: "4px",
              marginTop: "15px",
            }}
          >
            添加新订阅
          </a>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <a
              href="/subscription/add"
              style={{
                display: "inline-block",
                background: "#4CAF50",
                color: "white",
                padding: "10px 15px",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              添加新订阅
            </a>
          </div>
          <div>
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "15px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2 style={{ margin: "0 0 10px 0" }}>{sub.name}</h2>
                  <div>
                    <a
                      href={`/subscription/${sub.id}/edit`}
                      style={{
                        background: "#ffc107",
                        color: "black",
                        padding: "5px 10px",
                        textDecoration: "none",
                        borderRadius: "4px",
                        marginRight: "10px",
                        fontSize: "14px",
                      }}
                    >
                      编辑订阅
                    </a>
                    <a
                      href={`/subscription/${sub.id}/nodes`}
                      style={{
                        background: "#03a9f4",
                        color: "white",
                        padding: "5px 10px",
                        textDecoration: "none",
                        borderRadius: "4px",
                        marginRight: "10px",
                        fontSize: "14px",
                      }}
                    >
                      管理节点
                    </a>
                    <a
                      href={`/subscription/${sub.id}/rule/add`}
                      style={{
                        background: "#2196F3",
                        color: "white",
                        padding: "5px 10px",
                        textDecoration: "none",
                        borderRadius: "4px",
                        marginRight: "10px",
                        fontSize: "14px",
                      }}
                    >
                      添加规则
                    </a>
                    <a
                      href={`/subscription/delete/${sub.id}`}
                      style={{
                        background: "#f44336",
                        color: "white",
                        padding: "5px 10px",
                        textDecoration: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      删除订阅
                    </a>
                  </div>
                </div>
                <p>
                  订阅链接:{" "}
                  <code style={{ wordBreak: "break-all" }}>{sub.url}</code>
                </p>
                <p>
                  Clash 配置访问链接:{" "}
                  <a href={`/clash/${sub.id}`}>{`/clash/${sub.id}`}</a>
                </p>

                <div
                  style={{ marginTop: "15px", display: "flex", gap: "20px" }}
                >
                  {/* 规则信息 */}
                  <div style={{ flex: 1 }}>
                    <h3>订阅规则</h3>
                    {!sub.rules || sub.rules.length === 0 ? (
                      <p>暂无自定义规则</p>
                    ) : (
                      <ul style={{ padding: "0 0 0 20px" }}>
                        {sub.rules.map((rule) => (
                          <li key={rule.id} style={{ marginBottom: "10px" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span>
                                <strong>{rule.type}:</strong> {rule.content}
                              </span>
                              <a
                                href={`/subscription/${sub.id}/rule/delete/${rule.id}`}
                                style={{
                                  color: "#f44336",
                                  textDecoration: "none",
                                  fontSize: "14px",
                                }}
                              >
                                删除
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* 节点信息 */}
                  <div style={{ flex: 1 }}>
                    <h3>自定义节点</h3>
                    {!sub.nodes || sub.nodes.length === 0 ? (
                      <p>暂无自定义节点</p>
                    ) : (
                      <ul style={{ padding: "0 0 0 20px" }}>
                        {sub.nodes.map((node) => (
                          <li key={node.id} style={{ marginBottom: "10px" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span>
                                <strong>{node.name}</strong> ({node.type})
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default SubscriptionList;
