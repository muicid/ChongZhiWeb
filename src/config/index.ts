import type { SiteConfig } from '../types'
import { chapters } from './chapters'
import { records } from './records'
import { rechargeLink } from './links'
import { copy, motion, theme } from './settings'

/**
 * ChatGPT Plus 充值操作指南 —— 配置驱动的编辑叙事站点。
 * 配置入口：长篇内容与界面设置分文件维护；质保期统一为 31 天。
 */
export const siteConfig = {
  locale: 'zh-CN',
  siteTitle: 'ChatGPT Plus 充值指南｜卡密兑换与到账核查',
  siteDescription: '从卡密到 Plus 标识的四步旅程：提交卡密、提交 Session、确认结果、到账核查，附质保与售后须知。',
  theme,
  brand: {
    name: '充值指南',
    subtitle: 'ChatGPT Plus 充值指南',
    edition: '2026 · CHATGPT PLUS GUIDE',
    sealCharacter: '充',
  },
  navigation: [
    { id: 'cover', index: '一', label: '首页' },
    { id: 'chapters', index: '二', label: '充值步骤' },
    { id: 'landscape', index: '三', label: '流程图' },
    { id: 'specimen', index: '四', label: '所需材料' },
    { id: 'records', index: '五', label: '常见问题' },
    { id: 'colophon', index: '六', label: '售后说明' },
  ],
  hero: {
    rechargeLink,
    product: 'ChatGPT Plus',
    kicker: '卡密兑换 · 四步操作 · 到账核查',
    title: '充值指南',
    statement: '跟着步骤完成卡密验证、Session 提交与 Plus 权益确认。从开始兑换到核查到账，每一步都有指引。',
    scrollLabel: '查看充值步骤',
    benefits: ['卡密长期有效', '31 天质保', '附常见问题解答'],
    image: {
      src: './media/ink-panorama.webp',
      alt: '水墨山水长卷，山峦间隐约刻着细密的线路纹理',
      position: '60% 60%',
    },
  },
  chapters,
  landscape: {
    kicker: 'HOW IT WORKS · 流程总览',
    title: '充值流程图',
    intro: '从卡密验证到权益到账，按顺序完成这四步。点击任一步骤，查看具体操作。',
    readyTitle: '准备好，再开始',
    readyText: '备好店铺发放的卡密，并在浏览器登录需要充值的 ChatGPT 账号。',
    prepareLabel: '查看所需材料',
    folio: 'RECHARGE FOLIO · 004',
    image: {
      src: './media/ink-panorama.webp',
      alt: '群峰与河谷展开成可阅读流程的水墨山水',
      position: '64% 58%',
    },
    markers: [
      { id: 'mark-cdk', chapterId: 'submit-cdk', label: '验证卡密', text: '打开充值网站，粘贴店铺发送的卡密，验证通过后继续。', x: 16, y: 24, align: 'start' },
      { id: 'mark-session', chapterId: 'submit-session', label: '提交 Session', text: '登录 ChatGPT，按教程获取完整的会话内容，返回充值网站提交。', x: 30, y: 47, align: 'start' },
      { id: 'mark-done', chapterId: 'confirm-result', label: '等待完成', text: '提交任务后保持页面打开，等待显示「充值已完成」。', x: 80, y: 35, align: 'end' },
      { id: 'mark-check', chapterId: 'check-arrival', label: '核查到账', text: '返回 ChatGPT 网页端刷新，确认 Plus 权益与邮箱订阅账单。', x: 84, y: 70, align: 'end' },
    ],
    axisLabels: ['卡密 · 充值提交', '会话 · chatgpt.com', '权益 · Plus'],
  },
  specimen: {
    kicker: 'BEFORE YOU START · 所需材料',
    title: '充值前准备',
    period: '店铺发放 · 长期有效',
    material: 'CDK 卡密 · Session 会话',
    summary: '准备两项材料，确认账号状态，就可以开始。具体获取方式都在下方。',
    image: {
      src: './media/knot-icon-blue.png',
      alt: 'ChatGPT 结形标志的淡蓝色图标',
      position: '50% 50%',
    },
    notes: [
      { id: 'cdk', heading: 'CDK 卡密', tag: '店铺发放 · 长期有效', text: '在店铺发货信息中找到兑换卡密，完整复制并保留。当前订阅未到期，可先持密等待账号显示「free」后再充值。', chapterId: 'submit-cdk', actionLabel: '查看卡密验证方法' },
      { id: 'session', heading: 'Session 会话', tag: '登录后获取 · 按教程操作', text: '在浏览器登录需要充值的 ChatGPT 账号，再按教程获取完整的会话内容。Session 属于敏感信息，请勿发给无关人员。', chapterId: 'submit-session', actionLabel: '查看 Session 获取方法' },
    ],
    scaleLabels: ['密', '会', '权'],
    checklist: {
      kicker: 'READY CHECK',
      title: '开始前，确认这三件事',
      items: [
        { title: '卡密已备好', text: '复制完整，没有遗漏或多余空格。' },
        { title: '账号已确认', text: '登录的是本次需要充值的账号。' },
        { title: '订阅状态符合要求', text: '本渠道需账号显示 free；其他状态请先联系客服确认。' },
      ],
      actionLabel: '准备好了，验证卡密',
      hint: '将在新标签页打开充值网站',
    },
  },
  records,
  colophon: {
    kicker: '售后说明 · 充值成功后 31 天质保',
    quote: 'Plus 充值完成，售后仍有保障。',
    note: '质保自充值成功之日起算，具体范围见「常见问题」中的质保与售后说明。遇到充值或到账问题，请保留结果页面截图，联系店铺客服核查。',
    restartLabel: '返回首页',
  },
  copy,
  motion,
} satisfies SiteConfig
