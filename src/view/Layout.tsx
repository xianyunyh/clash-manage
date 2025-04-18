import { FC } from 'hono/jsx'
import { css, Style } from 'hono/css'
const Layout: FC = (props) => {
  const style = css`
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
  `
  return (
    <html>
      <head>
        <title>Clash 订阅配置工具</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Clash 订阅配置工具" />
        <link href="//cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous" />
        <script src="//cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js" crossorigin="anonymous" defer></script>      
        <Style >{style}</Style>
      </head>
      <body>
        <div className="nav">
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