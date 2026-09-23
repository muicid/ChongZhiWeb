import { useId, useState } from 'react'

const wechat = 'mu24-42um'

export function WechatContact() {
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  const [message, setMessage] = useState('')

  async function copyWechat() {
    try {
      await navigator.clipboard.writeText(wechat)
      setMessage('已复制微信号')
    } catch {
      setMessage('请长按或选中微信号复制')
    }
  }

  return (
    <aside className="wechat-contact" aria-label="客服微信联系方式" data-expanded={expanded}>
      <button
        className="wechat-contact__toggle"
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => {
          setExpanded(!expanded)
          setMessage('')
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 11a8 8 0 0 1-8 8H8l-5 3 1-6a8 8 0 1 1 16-5Z" /><path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="3" strokeLinecap="round" /></svg>
        <span>{expanded ? '收起客服' : '联系客服'}</span>
        <span className="wechat-contact__indicator" aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>
      <div id={panelId} className="wechat-contact__panel" hidden={!expanded}>
        <div className="wechat-contact__label">
          <span>客服微信：<strong>{wechat}</strong></span>
        </div>
        <button className="wechat-contact__copy" type="button" onClick={copyWechat} aria-label={`复制微信号 ${wechat}`}>复制微信号</button>
        <span className="wechat-contact__status" role="status">{message}</span>
      </div>
    </aside>
  )
}
