import { Section } from '../types';

/** 九大板块定义（顺序固定） */
export const SECTIONS: Section[] = [
  {
    id: 'health',
    title: '医疗与健康',
    icon: 'medkit',
    color: '#FF6B6B',
    description: '校医院、医保、就医指南',
  },
  {
    id: 'transport',
    title: '出行与交通',
    icon: 'bus',
    color: '#4ECDC4',
    description: '地铁、公交、共享单车',
  },
  {
    id: 'life',
    title: '生活与服务',
    icon: 'home',
    color: '#FFE66D',
    description: '水电网、快递、洗衣',
  },
  {
    id: 'finance',
    title: '消费与理财',
    icon: 'wallet',
    color: '#95E1D3',
    description: '银行卡、优惠、记账',
  },
  {
    id: 'certificate',
    title: '证件办理',
    icon: 'document-text',
    color: '#F38181',
    description: '身份证、护照、居住证',
  },
  {
    id: 'career',
    title: '职场与社保',
    icon: 'briefcase',
    color: '#AA96DA',
    description: '实习、社保、公积金',
  },
  {
    id: 'legal',
    title: '法律与安全',
    icon: 'shield-checkmark',
    color: '#FCBAD3',
    description: '维权、防骗、安全',
  },
  {
    id: 'social',
    title: '社交与人际',
    icon: 'people',
    color: '#A8D8EA',
    description: '社团、交友、活动',
  },
  {
    id: 'study',
    title: '学习',
    icon: 'book',
    color: '#3A86FF',
    description: '图书馆、选课、考研',
  },
];

export const SECTION_MAP = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s])
) as Record<string, Section>;
