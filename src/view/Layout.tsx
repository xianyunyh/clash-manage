import { FC } from 'hono/jsx'

const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <title>Clash 订阅配置工具</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          a {
            color: #1a73e8;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .nav {
            margin-bottom: 30px;
          }
          .nav a {
            margin-right: 15px;
          }
        `}</style>
      </head>
      <body>
        <div className="nav">
          <a href="/">首页</a>
          <a href="/subscriptions">管理订阅</a>
        </div>
        <div className="container">
          {props.children}
        </div>
      </body>
    </html>
  )
}

export default Layout