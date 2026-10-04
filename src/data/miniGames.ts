import { DEFAULT_THEMES } from './defaultThemes';

export const DEFAULT_ACTIONS = ['拥抱', '亲吻额头', '牵手', '揉肩', '轻声夸赞', '鼻尖相碰'];
export const DEFAULT_POSES = ['面对面坐着', '并肩坐着', '面对面站着', '侧躺着', '依偎坐着', '背后环抱'];
export const LEGACY_DICE_LEVELS = [
  { id: 'gentle', name: '温柔', actions: ['牵手', '夸赞对方', '击掌', '揉肩', '手心写字', '对视微笑'], poses: ['面对面坐着', '并肩坐着', '站在身旁', '背靠背坐着', '面对面站着', '手挽手站着'] },
  { id: 'intimate', name: '亲密', actions: DEFAULT_ACTIONS, poses: DEFAULT_POSES },
  { id: 'advanced', name: '进阶', actions: ['拥抱一分钟', '亲吻', '肩颈按摩', '耳边说情话', '交换一个愿望', '闭眼接受拥抱'], poses: ['依偎坐着', '并肩躺着', '面对面侧躺', '从身后环抱', '面对面站着', '坐在对方身旁'] },
] as const;
export type DiceLevel = typeof LEGACY_DICE_LEVELS[number]['id'];

export function extractDiceWords(tasks: string[], fallback: { actions: readonly string[]; poses: readonly string[] }) {
  const actions: string[] = [];
  const poses: string[] = [];
  const add = (list: string[], value: string) => {
    const text = value.trim();
    if (text && text.length <= 24 && !list.includes(text)) list.push(text);
  };
  // Copy short excerpts from existing tasks; do not invent or concatenate instructions.
  for (const task of tasks) {
    for (const clause of task.split(/[，,。；;（()）]/)) {
      const action = clause.match(/(?:亲吻|拥抱|抚摸|按摩|舔舐|轻咬|啃咬|湿吻|脱掉|牵手|十指紧扣|拍打|磨蹭|描绘|含住|吸吮|服务|对视|模仿|说出|写一个字|蹭对方|摸摸)[^，,。；;（()）]*/);
      if (action) add(actions, action[0]);
      for (const match of clause.matchAll(/(?:面对面坐着|面对面站着|背靠背坐着|并肩躺着|并肩坐着|从背后抱住对方|从背后抱着对方|跨坐在对方身上|平躺|躺平|躺下|跪趴|侧卧位|侧躺|仰卧床边|站在床边|[^，,。；;（()）]{1,12}姿势)/g)) add(poses, match[0]);
    }
  }
  return {
    actions: [...actions, ...fallback.actions.filter(item => !actions.includes(item))].slice(0, 6),
    poses: [...poses, ...fallback.poses.filter(item => !poses.includes(item))].slice(0, 6),
    extractedActions: actions.length,
    extractedPoses: poses.length,
  };
}

const sourceIds: Record<DiceLevel, string> = { gentle: 'sweet', intimate: 'love', advanced: 'intimate' };
export const DICE_LEVELS = LEGACY_DICE_LEVELS.map(level => {
  const sourceId = sourceIds[level.id];
  const theme = DEFAULT_THEMES.find(item => item.id === sourceId);
  const words = extractDiceWords(theme?.tasks || [], level);
  return { id: level.id, name: level.name, sourceId, actions: words.actions, poses: words.poses };
});
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
