export const DEFAULT_ACTIONS = ['拥抱', '亲吻额头', '牵手', '揉肩', '轻声夸赞', '鼻尖相碰'];
export const DEFAULT_POSES = ['面对面坐着', '并肩坐着', '面对面站着', '侧躺着', '依偎坐着', '背后环抱'];
export const DICE_LEVELS = [
  { id: 'gentle', name: '温柔', actions: ['牵手', '夸赞对方', '击掌', '揉肩', '手心写字', '对视微笑'], poses: ['面对面坐着', '并肩坐着', '站在身旁', '背靠背坐着', '面对面站着', '手挽手站着'] },
  { id: 'intimate', name: '亲密', actions: DEFAULT_ACTIONS, poses: DEFAULT_POSES },
  { id: 'advanced', name: '进阶', actions: ['拥抱一分钟', '亲吻', '肩颈按摩', '耳边说情话', '交换一个愿望', '闭眼接受拥抱'], poses: ['依偎坐着', '并肩躺着', '面对面侧躺', '从身后环抱', '面对面站着', '坐在对方身旁'] },
] as const;
export type DiceLevel = typeof DICE_LEVELS[number]['id'];
export const TRUTH_QUESTIONS = [
  '第一次见到我时，你的第一印象是什么？',
  '我们一起经历的哪一刻让你最开心？',
  '你最喜欢我哪一个小习惯？',
  '下次约会你最想去哪里？',
  '你觉得我们最默契的地方是什么？',
  '你希望我怎样表达关心？',
  '你最想和我一起尝试什么新鲜事？',
  '有什么一直想对我说的小秘密？',
  '哪一首歌会让你想到我们？',
  '你最喜欢我们哪一张合照？',
  '今天有什么事让你觉得被爱着？',
  '你希望我们一起养成什么习惯？',
];
export const MATCH_QUESTIONS = [
  '我们下一次约会最适合去哪里？',
  '如果现在点外卖，我们会选什么？',
  '谁更容易在看电影时睡着？',
  '我们最常说的一句话是什么？',
  '一起旅行最想去哪个城市？',
  '我们最喜欢一起做的事是什么？',
  '谁更可能记错约会时间？',
  '用一种颜色形容我们，会是什么？',
  '如果一起养宠物，会选什么？',
  '哪首歌最适合当我们的主题曲？',
];

export function drawItem(items: string[], previous?: string): string {
  const candidates = items.filter(item => item !== previous);
  const pool = candidates.length ? candidates : items;
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : '';
}
