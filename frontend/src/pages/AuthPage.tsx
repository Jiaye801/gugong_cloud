import { ArrowLeftRight, Shield, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import { useAppStore } from '../store/useAppStore'

export function AuthPage() {
  const navigate = useNavigate()
  const login = useAppStore((state) => state.login)
  const register = useAppStore((state) => state.register)
  const resetAuthState = useAppStore((state) => state.resetAuthState)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'VISITOR' | 'ADMIN'>('VISITOR')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const applyDemoAccount = (nextRole: 'VISITOR' | 'ADMIN') => {
    setMode('login')
    setRole(nextRole)
    setMessage('')
    if (nextRole === 'ADMIN') {
      setAccount('admin')
      setPassword('admin123')
      return
    }
    setAccount('visitor')
    setPassword('visitor123')
  }

  const submit = async () => {
    setSubmitting(true)
    setMessage('')
    try {
      if (mode === 'register') {
        await register({ account, password, nickname })
      } else {
        await login({ account, password, role })
      }
      navigate(role === 'ADMIN' ? '/admin' : '/')
    } catch (error) {
      await resetAuthState()
      if (axios.isAxiosError(error)) {
        setMessage((error.response?.data as { message?: string } | undefined)?.message ?? '提交失败，请检查账号、密码或所选身份是否正确。')
      } else {
        setMessage('提交失败，请检查账号、密码或所选身份是否正确。')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07111d] px-4 py-8 text-stone-100">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-panel rounded-[40px] p-8 md:p-10">
          <div className="text-xs uppercase tracking-[0.4em] text-amber-100/70">身份入口</div>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-stone-50">登录与注册</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-stone-300">
            游客身份用于地图导览、任务解锁、收藏、上传与游览感悟发布；管理员身份用于内容维护、路线校正、投稿审核与后台管理。
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <UserRound className="h-6 w-6 text-amber-200" />
              <div className="mt-4 text-xl text-stone-100">游客</div>
              <div className="mt-3 text-sm leading-7 text-stone-400">
                浏览总图、路线、专题与故事内容，完成任务，并留下你的游览记录。
              </div>
            </div>
            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <Shield className="h-6 w-6 text-sky-200" />
              <div className="mt-4 text-xl text-stone-100">管理员</div>
              <div className="mt-3 text-sm leading-7 text-stone-400">
                维护 POI、路线、任务与专题内容，并审核游客上传与故事投稿。
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-amber-200/15 bg-amber-200/8 p-5 text-sm leading-7 text-amber-50/90">
            演示账号：
            <br />
            游客：visitor / visitor123
            <br />
            管理员：admin / admin123
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <button
                onClick={() => applyDemoAccount('VISITOR')}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-stone-100 transition hover:border-amber-200/25"
              >
                一键填充游客账号
              </button>
              <button
                onClick={() => applyDemoAccount('ADMIN')}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-stone-100 transition hover:border-sky-200/25"
              >
                一键填充管理员账号
              </button>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[40px] p-8 md:p-10">
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-full px-4 py-3 text-sm ${mode === 'login' ? 'bg-amber-200/15 text-amber-100' : 'text-stone-400'}`}
            >
              登录
            </button>
            <button
              onClick={() => {
                setMode('register')
                setRole('VISITOR')
                setAccount('')
                setPassword('')
                setMessage('')
              }}
              className={`flex-1 rounded-full px-4 py-3 text-sm ${mode === 'register' ? 'bg-amber-200/15 text-amber-100' : 'text-stone-400'}`}
            >
              注册
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex rounded-3xl border border-white/8 bg-white/[0.03] p-1">
              <button
                onClick={() => setRole('VISITOR')}
                className={`flex-1 rounded-[20px] px-4 py-3 text-sm ${role === 'VISITOR' ? 'bg-amber-200/12 text-amber-100' : 'text-stone-400'}`}
              >
                游客身份
              </button>
              <button
                onClick={() => setRole('ADMIN')}
                className={`flex-1 rounded-[20px] px-4 py-3 text-sm ${role === 'ADMIN' ? 'bg-sky-200/12 text-sky-100' : 'text-stone-400'}`}
              >
                管理员身份
              </button>
            </div>

            {mode === 'register' && (
              <input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="游客昵称" className="field" />
            )}
            <input value={account} onChange={(event) => setAccount(event.target.value)} placeholder="账号" className="field" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="密码" className="field" />

            {message && <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{message}</div>}

            <button
              onClick={() => void submit()}
              disabled={submitting || !account.trim() || !password.trim() || (mode === 'register' && !nickname.trim())}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-300 to-[#b8893a] px-5 py-3 text-sm font-medium text-stone-950 disabled:opacity-50"
            >
              {submitting ? '提交中...' : mode === 'register' ? '创建游客账号' : `以${role === 'ADMIN' ? '管理员' : '游客'}身份登录`}
            </button>

            <button onClick={() => navigate('/')} className="w-full rounded-2xl border border-white/10 px-5 py-3 text-sm text-stone-100">
              <ArrowLeftRight className="mr-2 inline h-4 w-4" />
              返回首页继续浏览
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
