import type { InterfaceCopy, MotionConfig, ThemeConfig } from '../types'

export const theme = {
  paper: '#eee5d5',
  paperDeep: '#e4d8c5',
  ink: '#28251f',
  mutedInk: '#6b6154',
  rule: '#b8aa94',
  accent: '#a62e26',
  mineral: '#667064',
} satisfies ThemeConfig

export const copy = {
  skipToContent: '跳到主要内容',
  primaryNavLabel: '充值指南导航',
  chapterNavLabel: '充值四步',
  chapterTitle: '充值只需四步',
  chapterIndexKicker: 'CHATGPT PLUS · 充值步骤',
  archiveFolio: 'GUIDE · 001 / 006',
  footerCredit: 'PLUS RECHARGE GUIDE · 2026',
  heroSignal: 'CHATGPT PLUS · 充值操作指南',
  specimenBandLabel: '卷 · {index} · 器物',
  specimenIconFieldLabel: '辅助图标标本',
  landscapeMarkersLabel: '充值流程节点',
  detailChapterLabel: '充值步骤详解',
  detailRecordLabel: '常见问题解答',
  recordFolioLabel: '充值须知',
  seasonalIndexLabel: '问题索引',
  findingsTitle: '操作要点',
  openChapter: '查看步骤',
  activeChapter: '当前步骤',
  imageUnavailable: '图像暂不可用',
  scrollProgress: '阅读进度',
  returnToTop: '返回首页',
  openChapterDetail: '展开此步',
  openRecordDetail: '查看详情',
  closeDetail: '关闭详情',
  chapterDetailBack: '返回充值四步',
  recordDetailBack: '返回须知与问答',
  nextChapter: '下一步',
  completeGuide: '完成阅读',
  nextRecord: '下一则',
  detailMissing: '此卷页不存在，或已送回档案。',
} satisfies InterfaceCopy

export const motion = {
  reveals: true,
  imageDrift: true,
  paperBreath: true,
  scrollCue: true,
} satisfies MotionConfig
