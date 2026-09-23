import type { RecordsConfig } from '../types'

export const records = {
  kicker: '第五章 · 行前须知',
  title: '须知与问答',
  intro: '动手之前，先读这四则：账号状态、质保售后、常见问题。它们决定了这趟充值是否顺畅，也写明了三十一天质保的边界。',
  primaryImage: {
    src: './media/ink-panorama.webp',
    alt: '适合作为须知背景的山谷水墨画',
    position: '74% 54%',
  },
  detailImage: {
    src: './media/step-arrival.svg',
    alt: 'Plus 权益与邮箱账单核查示意图',
    position: '50% 50%',
  },
  specimenImage: {
    src: './media/ink-token.webp',
    alt: '水墨风格的卡密凭证插画',
    position: '50% 50%',
  },
  entries: [
    {
      id: 'pre-check',
      index: '壹',
      season: '充值前',
      date: '动手之前必读',
      title: '充值前确认 · 账号需为 free',
      text: '本渠道适用于符合店铺充值条件的 ChatGPT 账号；菲区账号需等当前订阅过期、显示为「free」后才能充值。',
      detail: {
        phenology: '卡密一直有效——订阅未过期可先持密等待，显示「free」后再充值。',
        noteHeading: '确认要点',
        note: '若账号不是「free」状态，例如加入了 team 或 plus 续费未取消，请联系客服更换 iOS 渠道（需 10 元）。iOS 渠道可覆盖订阅，随时充值。',
        findings: [
          { label: '菲区账号', text: '须等当前订阅过期、显示「free」后再充值。' },
          { label: '非 free 状态', text: 'team 或续费未取消者，换 iOS 渠道，需 10 元。' },
          { label: '异常来源', text: '曾用异常低价或来源不明内购的账号，请先更换正常账号再提交充值。' },
        ],
        facts: [
          { label: '适用渠道', value: '网页兑换渠道' },
          { label: '前置状态', value: '账号显示 free' },
          { label: 'iOS 渠道', value: '10 元 · 可覆盖订阅' },
          { label: '卡密时效', value: '长期有效' },
          { label: '质保期', value: '充值成功后 31 天' },
        ],
      },
    },
    {
      id: 'warranty',
      index: '贰',
      season: '质保',
      date: '充值成功起算',
      title: '质保与售后 · 三十一天',
      text: '质保期为充值成功后 31 天；符合售后规则的掉订阅，可申请按天退款或补充订阅。',
      detail: {
        phenology: '质保三十一天，自充值成功之日起算。',
        noteHeading: '售后须知',
        note: '账号封禁、账号异常、违规使用、信息填写错误、账号地区异常或账号自身限制造成的问题，不属于店铺售后范围。如对流程存在疑问，请先联系客服确认；未开始充值前可按平台规则申请退款。',
        findings: [
          { label: '掉订阅', text: '符合售后规则者，按商品约定按天退款或补充订阅。' },
          { label: '不在售后', text: '封禁、异常风控、违规使用、信息填写错误等。' },
          { label: '退款', text: '未开始充值前，可按平台规则申请退款。' },
        ],
        facts: [
          { label: '质保期', value: '31 天' },
          { label: '起算点', value: '充值成功之日' },
          { label: '掉订阅', value: '按天退款或补充' },
          { label: '咨询入口', value: '店铺客服' },
          { label: '异常处理', value: '保留截图并核查' },
        ],
      },
    },
    {
      id: 'faq-plus',
      index: '叁',
      season: '问答',
      date: '常见问题 · 一',
      title: '刷新后还没有显示 Plus？',
      text: '先退出并重新登录 ChatGPT 网页端，再检查订阅状态；仍未显示时携截图找客服。',
      detail: {
        phenology: '显示延迟多为登录态缓存所致，重新登录通常即可恢复。',
        noteHeading: '排查顺序',
        note: '第一步：在 ChatGPT 网页端退出登录；第二步：重新登录并刷新页面；第三步：检查订阅状态。若仍未显示 Plus，请将兑换结果页面截图发送给客服核查。',
        findings: [
          { label: '第一步', text: '退出登录，清除旧的会话状态。' },
          { label: '第二步', text: '重新登录并刷新，检查订阅。' },
          { label: '第三步', text: '仍未显示则截图联系客服核查。' },
        ],
        facts: [
          { label: '常见原因', value: '登录态缓存' },
          { label: '首选操作', value: '退出并重新登录' },
          { label: '核查材料', value: '兑换结果截图' },
          { label: '核查入口', value: '店铺客服' },
          { label: '注意', value: 'App 显示可能有延迟' },
        ],
      },
    },
    {
      id: 'faq-session',
      index: '肆',
      season: '问答',
      date: '常见问题 · 二',
      title: '充值完成后 Session 如何失效？',
      text: '在 ChatGPT 网页端退出登录，当前 Session 即会失效；重新登录会生成新的会话凭证。',
      detail: {
        phenology: '退出登录，是收回这枚临时凭证的唯一动作。',
        noteHeading: '安全建议',
        note: 'Session 是浏览器登录后的临时会话凭证，不等同于账号密码，但仍属于敏感信息。请勿发送给无关人员；充值完成后退出 ChatGPT 网页登录，即可使当前 Session 失效。',
        findings: [
          { label: '失效方式', text: '网页端退出登录，当前 Session 立即失效。' },
          { label: '重新登录', text: '会生成全新的会话凭证，旧凭证作废。' },
          { label: '保密原则', text: '不发送给无关人员，只粘贴到兑换网站。' },
        ],
        facts: [
          { label: '性质', value: '临时会话凭证' },
          { label: '是否等同密码', value: '否' },
          { label: '敏感级别', value: '敏感信息' },
          { label: '失效动作', value: '退出登录' },
          { label: '建议时点', value: '充值完成后' },
        ],
      },
    },
  ],
} satisfies RecordsConfig
