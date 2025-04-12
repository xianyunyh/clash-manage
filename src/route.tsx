// 路由文件

import { Hono } from "hono";
import { Login } from "./view";


export default (app: Hono) => {
  app.get('/', (c) => {
    return c.html(<Login />)
  })
}