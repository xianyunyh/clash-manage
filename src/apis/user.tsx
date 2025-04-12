import { Context } from 'hono'
import { Env } from '../bindings'
import { Login } from '../view'
import { updateAuthCredentials, verifyCredentials } from '../middleware/auth'
import ChangePasswordForm from '../view/ChangePassword'

export async function UserLogin(c: Context<{ Bindings: Env }>) {

  try {
    const formData = await c.req.formData()
    const username = formData.get('username')?.toString()
    const password = formData.get('password')?.toString()

    if (!username || !password) {
      return c.html(
        <Login
          message="请输入用户名和密码"
          error={true}
        />
      )
    }

    // 验证用户名和密码
    const isValid = await verifyCredentials(c, username, password)
    if (isValid) {
      // 登录成功，设置 Basic Auth 头并重定向到订阅列表页面
      const credentials = btoa(`${username}:${password}`)
      return c.redirect('/subscriptions', 301)
    } else {
      // 登录失败，显示错误信息
      return c.html(
        <Login
          message="用户名或密码错误"
          error={true}
        />
      )
    }
  } catch (error) {
    console.error('登录处理出错:', error)
    return c.html(
      <Login
        message="登录处理发生错误，请稍后重试"
        error={true}
      />
    )
  }

}


export async function UserChangePwd(c: Context<{ Bindings: Env }>) {

  try {
    const formData = await c.req.formData()
    const username = formData.get('username')?.toString()
    const password = formData.get('password')?.toString()
    const confirmPassword = formData.get('confirmPassword')?.toString()

    if (!username || !password || !confirmPassword) {
      return c.html(
        <ChangePasswordForm
          message="请填写所有必填字段"
          error={true}
        />
      )
    }

    if (password !== confirmPassword) {
      return c.html(
        <ChangePasswordForm
          message="两次输入的密码不匹配"
          error={true}
        />
      )
    }

    // 更新认证凭据
    const result = await updateAuthCredentials(c, username, password)

    if (result) {
      return c.html(
        <ChangePasswordForm
          message="登录凭据已成功更新，下次登录时将使用新的用户名和密码"
          success={true}
        />
      )
    } else {
      return c.html(
        <ChangePasswordForm
          message="保存登录凭据时发生错误，请稍后重试"
          error={true}
        />
      )
    }
  } catch (error) {
    console.error('更新认证凭据出错:', error)
    return c.html(
      <ChangePasswordForm
        message="处理请求时发生错误，请稍后重试"
        error={true}
      />
    )
  }

}