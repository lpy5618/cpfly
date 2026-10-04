import { useEffect, useState } from 'react';
import { Check, Dices, Heart, Lock, MessageCircle, RotateCcw, Settings2, Shuffle, Sparkles, Unlock, Users, X } from 'lucide-react';
import { Player, Theme } from '../../types';
import { Dice } from '../Dice';
import { DICE_LEVELS, DiceLevel, drawItem, MATCH_QUESTIONS, TRUTH_QUESTIONS } from '../../data/miniGames';

type MiniGame = 'dice' | 'truth' | 'match';
type Settings = { actions: string[]; poses: string[]; questions: string[] };
type LevelSettings = Record<DiceLevel, Settings>;
const SETTINGS_KEY = 'couples-mini-games-settings-v1';
const defaults = Object.fromEntries(DICE_LEVELS.map(level => [level.id, { actions: [...level.actions], poses: [...level.poses], questions: TRUTH_QUESTIONS }])) as LevelSettings;
const primary = 'w-full h-12 rounded-full bg-white text-black font-semibold ios-btn flex items-center justify-center gap-2 disabled:opacity-40';
const secondary = 'h-11 px-4 rounded-xl bg-[#2C2C2E] text-gray-200 ios-btn flex items-center justify-center gap-2 disabled:opacity-40';
const input = 'w-full p-3 rounded-xl bg-[#2C2C2E] border border-white/10 text-white outline-none focus:border-white/40';

function loadSettings(): LevelSettings {
  try {
    const value = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    const valid = (items: unknown, count?: number): items is string[] => Array.isArray(items)
      && items.length > 0 && (!count || items.length === count)
      && items.every(item => typeof item === 'string' && item.trim().length > 0 && item.length <= 120);
    return Object.fromEntries(DICE_LEVELS.map(level => [level.id, {
      actions: valid(value?.[level.id]?.actions, 6) ? value[level.id].actions : [...level.actions],
      poses: valid(value?.[level.id]?.poses, 6) ? value[level.id].poses : [...level.poses],
      questions: valid(value?.[level.id]?.questions) ? value[level.id].questions : TRUTH_QUESTIONS,
    }])) as LevelSettings;
  } catch { return defaults; }
}

export function MiniGamesView({ themes, players }: { themes: Theme[]; players: Player[] }) {
  const [game, setGame] = useState<MiniGame>('dice');
  const [levelSettings, setLevelSettings] = useState(loadSettings);
  const [level, setLevel] = useState<DiceLevel>('intimate');
  const settings = levelSettings[level];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ actions: '', poses: '', questions: '' });
  const [error, setError] = useState('');
  const games = [
    { id: 'dice' as const, name: '双骰子', icon: Dices },
    { id: 'truth' as const, name: '真心话', icon: Heart },
    { id: 'match' as const, name: '默契问答', icon: Users },
  ];

  const openSettings = () => {
    setDraft({ actions: settings.actions.join('\n'), poses: settings.poses.join('\n'), questions: settings.questions.join('\n') });
    setError('');
    setEditing(true);
  };

  const saveSettings = () => {
    const parse = (text: string) => text.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
    const next = { actions: parse(draft.actions), poses: parse(draft.poses), questions: parse(draft.questions) };
    if (next.actions.length !== 6 || next.poses.length !== 6) { setError('动作和姿势都需要填写 6 项，每行一项。'); return; }
    if (!next.questions.length) { setError('至少填写一个真心话问题。'); return; }
    if (next.actions.some(item => item.length > 24) || next.poses.some(item => item.length > 24)
      || next.questions.some(item => item.length > 120)) { setError('动作和姿势每项最多 24 字，问题最多 120 字。'); return; }
    try {
      const updated = { ...levelSettings, [level]: next };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      setLevelSettings(updated);
      setEditing(false);
    } catch { setError('保存失败，请检查浏览器存储空间。'); }
  };

  return (
    <section className="minigames space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">情侣小游戏</h2>
        <button className={secondary + ' !px-3'} title="编辑小游戏词库" aria-label="编辑小游戏词库" onClick={openSettings}><Settings2 size={20} /></button>
      </div>
      <div className="grid grid-cols-3 gap-1 bg-[#1C1C1E] rounded-xl p-1" role="tablist" aria-label="小游戏">
        {games.map(({ id, name, icon: Icon }) => (
          <button key={id} role="tab" aria-selected={game === id} onClick={() => setGame(id)}
            className={`flex flex-col items-center justify-center gap-1 h-16 rounded-lg text-xs font-medium ios-btn ${game === id ? 'bg-[#3A3A3C] text-white' : 'text-gray-400'}`}>
            <Icon size={20} /><span>{name}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={games.find(item => item.id === game)?.name}>
        {game === 'dice' && <div className="grid grid-cols-3 gap-2 mb-5" role="group" aria-label="骰子等级">
          {DICE_LEVELS.map(item => <button key={item.id} className={secondary + (level === item.id ? ' !bg-white !text-black' : '')} aria-pressed={level === item.id} onClick={() => setLevel(item.id)}>{item.name}</button>)}
        </div>}
        {game === 'dice' && <DoubleDice settings={settings} players={players} />}
        {game === 'truth' && <TruthOrDare settings={settings} themes={themes} players={players} />}
        {game === 'match' && <MatchGame players={players} />}
      </div>
      {editing && (
        <div className="fixed inset-0 z-[150] bg-black/70 flex items-end justify-center" onClick={() => setEditing(false)}>
          <section role="dialog" aria-modal="true" aria-label="小游戏词库" className="w-full max-w-[430px] bg-[#1C1C1E] rounded-t-[32px] p-6 max-h-[85dvh] overflow-y-auto" onClick={event => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold">{DICE_LEVELS.find(item => item.id === level)?.name}词库</h3>
              <button className={secondary + ' !px-3'} title="关闭" aria-label="关闭词库" onClick={() => setEditing(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {([{ key: 'actions', label: '动作（6 项）' }, { key: 'poses', label: '姿势（6 项）' }, { key: 'questions', label: '真心话问题' }] as const).map(({ key, label }) => (
                <label key={key} className="block text-sm text-gray-300">{label}
                  <textarea className={input + ' mt-2 h-36 resize-y'} value={draft[key]} onChange={event => setDraft({ ...draft, [key]: event.target.value })} />
                </label>
              ))}
              {error && <p role="alert" className="text-sm text-[#FF453A]">{error}</p>}
              <div className="flex gap-2">
                <button className={secondary} title="恢复默认词库" aria-label="恢复默认词库" onClick={() => setDraft({ actions: defaults[level].actions.join('\n'), poses: defaults[level].poses.join('\n'), questions: TRUTH_QUESTIONS.join('\n') })}><RotateCcw size={18} /></button>
                <button className={primary} onClick={saveSettings}><Check size={18} />保存词库</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function DoubleDice({ settings, players }: { settings: Settings; players: Player[] }) {
  const [faces, setFaces] = useState<[number | null, number | null]>([null, null]);
  const [locked, setLocked] = useState([false, false]);
  const [rolling, setRolling] = useState(false);
  const [turn, setTurn] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setFaces([null, null]);
    setLocked([false, false]);
    setRolling(false);
    setHistory([]);
  }, [settings]);

  useEffect(() => {
    if (!rolling) return;
    const timer = setTimeout(() => {
      const next: [number, number] = [locked[0] && faces[0] ? faces[0] : Math.floor(Math.random() * 6) + 1,
        locked[1] && faces[1] ? faces[1] : Math.floor(Math.random() * 6) + 1];
      setFaces(next);
      setHistory(items => [`${settings.poses[next[1] - 1]} · ${settings.actions[next[0] - 1]}`, ...items].slice(0, 5));
      setRolling(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [rolling, locked, faces, settings]);

  const ready = faces[0] !== null && faces[1] !== null;
  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-[#0A84FF]">{players[turn]?.name}的回合</p>
      <div className="grid grid-cols-2 gap-4 py-3">
        {['动作', '姿势'].map((label, index) => (
          <div key={label} className="flex flex-col items-center gap-4 min-w-0">
            <span className="text-sm text-gray-400">{label}</span>
            <div className="w-20 h-20" aria-label={`${label}骰子`}><Dice isRolling={rolling && !locked[index]} result={faces[index]} /></div>
            <p className="text-center text-base font-semibold min-h-12 flex items-center justify-center break-words w-full">
              {rolling && !locked[index] ? '…' : faces[index] ? (index === 0 ? settings.actions : settings.poses)[faces[index]! - 1] : '待掷骰'}
            </p>
            <button disabled={rolling || !faces[index]} aria-pressed={locked[index]} title={locked[index] ? `解锁${label}` : `锁定${label}`} aria-label={locked[index] ? `解锁${label}` : `锁定${label}`}
              className={secondary + (locked[index] ? ' text-[#FF9F0A]' : '')} onClick={() => setLocked(values => values.map((value, i) => i === index ? !value : value))}>
              {locked[index] ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button className={primary} disabled={rolling || locked.every(Boolean)} onClick={() => setRolling(true)}><Dices size={20} />{rolling ? '掷骰中…' : '掷双骰'}</button>
        <button className={secondary + ' shrink-0 h-12'} disabled={!ready || rolling} onClick={() => setTurn(value => 1 - value)}>下一位</button>
      </div>
      {history.length > 0 && <div className="border-t border-white/10 pt-4 space-y-2">
        <h3 className="text-xs text-gray-500">最近组合</h3>
        {history.map((item, index) => <p key={`${index}-${item}`} className={`text-sm break-words ${index === 0 ? 'text-white' : 'text-gray-500'}`}>{item}</p>)}
      </div>}
    </div>
  );
}

function TruthOrDare({ settings, themes, players }: { settings: Settings; themes: Theme[]; players: Player[] }) {
  const [kind, setKind] = useState<'truth' | 'dare'>('truth');
  const [themeId, setThemeId] = useState(themes[0]?.id || '');
  const [turn, setTurn] = useState(0);
  const [prompt, setPrompt] = useState('');
  const selectedTheme = themes.find(theme => theme.id === themeId) || themes[0];
  const pool = kind === 'truth' ? settings.questions : selectedTheme?.tasks || [];
  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-[#FF375F]">{players[turn]?.name}的回合</p>
      <div className="grid grid-cols-2 gap-2">
        {(['truth', 'dare'] as const).map(value => <button key={value} aria-pressed={kind === value} className={secondary + (kind === value ? ' !bg-white !text-black' : '')}
          onClick={() => { setKind(value); setPrompt(''); }}>{value === 'truth' ? <MessageCircle size={18} /> : <Sparkles size={18} />}{value === 'truth' ? '真心话' : '大冒险'}</button>)}
      </div>
      {kind === 'dare' && <label className="block text-xs text-gray-400">任务题库
        <select className={input + ' mt-2'} value={selectedTheme?.id || ''} onChange={event => { setThemeId(event.target.value); setPrompt(''); }}>
          {themes.map(theme => <option key={theme.id} value={theme.id}>{theme.name} · {theme.tasks.length} 张</option>)}
        </select>
      </label>}
      <div className="min-h-[200px] border-y border-white/10 py-8 flex flex-col items-center justify-center gap-5">
        {kind === 'truth' ? <Heart size={32} className="text-[#FF375F]" /> : <Sparkles size={32} className="text-[#FF9F0A]" />}
        <p className="text-xl font-medium text-center leading-relaxed break-words w-full" aria-live="polite">{prompt || (pool.length ? '准备好了吗？' : '这份题库还没有任务卡')}</p>
      </div>
      <button className={primary} disabled={!pool.length} onClick={() => setPrompt(previous => drawItem(pool, previous))}><Shuffle size={18} />{prompt ? '换一张' : '抽一张'}</button>
      <button className={secondary + ' w-full'} disabled={!prompt} onClick={() => { setTurn(value => 1 - value); setPrompt(''); }}><Check size={18} />完成，下一位</button>
    </div>
  );
}

function MatchGame({ players }: { players: Player[] }) {
  const [question, setQuestion] = useState(MATCH_QUESTIONS[0]);
  const [phase, setPhase] = useState<'first' | 'pass' | 'second' | 'reveal'>('first');
  const [answers, setAnswers] = useState(['', '']);
  const [rounds, setRounds] = useState(0);
  const [score, setScore] = useState(0);
  const index = phase === 'first' ? 0 : 1;

  const next = (matched: boolean) => {
    setRounds(value => value + 1);
    if (matched) setScore(value => value + 1);
    setQuestion(previous => drawItem(MATCH_QUESTIONS, previous));
    setAnswers(['', '']);
    setPhase('first');
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between text-xs text-gray-400"><span>第 {rounds + 1} 题</span><span>默契 {score} / {rounds}</span></div>
      <p className="text-xl font-medium leading-relaxed text-center min-h-24 flex items-center justify-center">{question}</p>
      {phase === 'pass' ? <div className="text-center space-y-6 py-6">
        <Lock size={32} className="mx-auto text-[#FF9F0A]" />
        <p className="text-gray-300">轮到{players[1]?.name}作答</p>
        <button className={primary} onClick={() => setPhase('second')}>我准备好了</button>
      </div> : phase === 'reveal' ? <div className="space-y-4">
        {answers.map((answer, i) => <div key={i} className="border-t border-white/10 pt-4"><p className="text-xs text-gray-400 mb-2">{players[i]?.name}的答案</p><p className="text-lg break-words">{answer}</p></div>)}
        <div className="grid grid-cols-2 gap-2 pt-4">
          <button className={secondary} onClick={() => next(false)}>各有想法</button>
          <button className={primary + ' !rounded-xl'} onClick={() => next(true)}><Check size={18} />默契一致</button>
        </div>
      </div> : <div className="space-y-4">
        <label className="block text-sm text-gray-400">{players[index]?.name}的答案
          <textarea className={input + ' mt-2 h-32 resize-none'} maxLength={120} value={answers[index]} onChange={event => setAnswers(values => values.map((value, i) => i === index ? event.target.value : value))} />
        </label>
        <button className={primary} disabled={!answers[index].trim()} onClick={() => setPhase(phase === 'first' ? 'pass' : 'reveal')}>{phase === 'first' ? <Lock size={18} /> : <Users size={18} />}{phase === 'first' ? '保存答案，交给对方' : '一起揭晓'}</button>
      </div>}
    </div>
  );
}
