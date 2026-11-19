import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, Maximize2, X, ExternalLink } from 'lucide-react';
import { asset } from '../lib/asset';
import './article-reader.css';

export type ArticleId = 'luckin' | 'commerce';
type TextBlock = { type: 'paragraph' | 'heading'; text: string };
type ImageBlock = { type: 'image'; src: string; alt: string; width: number; height: number };
type Article = { title: string; publisher: string; published: string; sourceUrl: string; minutes: number; blocks: (TextBlock | ImageBlock)[] };
const articleCache = new Map<ArticleId, Article>();

function useArticle(id: ArticleId) {
  const [article, setArticle] = useState<Article | null>(articleCache.get(id) ?? null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const cached = articleCache.get(id);
    if (cached) { setArticle(cached); return; }
    const controller = new AbortController();
    setError(false);
    fetch(asset(`articles/${id}.json`), { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Article unavailable');
      return response.json() as Promise<Article>;
    }).then(data => { articleCache.set(id, data); setArticle(data); }).catch(e => { if (e.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [id, attempt]);
  return { article, error, retry: () => setAttempt(value => value + 1) };
}

function ArticleBody({ article, preview = false }: { article: Article; preview?: boolean }) {
  const start = preview ? Math.max(0, article.blocks.findIndex(block => block.type !== 'image')) : 0;
  return <div className="article-prose">{article.blocks.slice(start).map((block, i) => block.type === 'image'
    ? <img key={i} src={asset(block.src)} alt={block.alt} width={block.width} height={block.height} loading="lazy" />
    : block.type === 'heading' ? <h4 key={i}>{block.text}</h4> : <p key={i}>{block.text}</p>)}</div>;
}

export function ArticlePreview({ id, onExpand }: { id: ArticleId; onExpand: () => void }) {
  const { article, error, retry } = useArticle(id);
  const [reading, setReading] = useState(false);
  const [progress, setProgress] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (reading) scroller.current?.focus({ preventScroll: true });
  }, [reading]);
  return <div className={`article-paper ${reading ? 'is-reading' : ''}`}>
    <div className="article-paper-toolbar"><span>READING ROOM / 正文</span><button type="button" onClick={onExpand} aria-label={`展开${article?.title ?? '文章'}全文`}><Maximize2 size={16} /></button></div>
    {article ? <><div className="article-paper-heading"><h4>{article.title}</h4><p>{article.publisher}<span>约 {article.minutes} 分钟</span></p></div>
      <div className="article-reading-progress" role="progressbar" aria-label="文章阅读进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
      <div className="article-scroll" ref={scroller} tabIndex={reading ? 0 : -1} role="region" aria-label={`${article.title}，可滚动阅读`} onScroll={event => { const el = event.currentTarget; setProgress(Math.round(el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight) * 100)); }} onKeyDown={event => { if (event.key === 'Escape') { setReading(false); toggle.current?.focus({ preventScroll: true }); event.stopPropagation(); } }}>
        <ArticleBody article={article} preview />
        <a className="article-source" href={article.sourceUrl} target="_blank" rel="noreferrer">查看微信原文<ExternalLink size={14} /></a>
      </div>
      <div className="article-paper-footer"><button type="button" className="article-read-toggle" ref={toggle} aria-pressed={reading} onClick={() => setReading(value => !value)}>{reading ? '退出卡片阅读' : '在卡片中阅读'}<ArrowDown size={16} /></button><button type="button" onClick={onExpand}>展开全文<ArrowUpRight size={16} /></button></div>
    </> : <div className="article-load-state" role="status">{error ? <><p>正文暂时无法载入</p><button type="button" onClick={retry}>重新载入</button></> : '正在准备正文…'}</div>}
  </div>;
}

export function ArticleDialog({ id, onClose }: { id: ArticleId; onClose: () => void }) {
  const { article, error, retry } = useArticle(id);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current!;
    const last = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    el.showModal();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; last?.focus({ preventScroll: true }); };
  }, []);
  return <dialog className="article-dialog" ref={dialog} aria-label={article?.title ?? '文章全文'} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="article-dialog-shell"><header><span>READING ROOM / 文章阅读</span><div>{article && <a href={article.sourceUrl} target="_blank" rel="noreferrer">微信原文<ExternalLink size={16} /></a>}<button type="button" onClick={onClose} aria-label="关闭文章"><X size={22} /></button></div></header><div className="article-dialog-scroll">{article ? <article className="article-full"><div className="article-full-title"><span>{article.publisher}{article.published && ` · ${article.published}`}</span><h2>{article.title}</h2><p>约 {article.minutes} 分钟阅读</p></div><ArticleBody article={article} /><a className="article-source" href={article.sourceUrl} target="_blank" rel="noreferrer">查看微信原文<ExternalLink size={15} /></a></article> : <div className="article-load-state" role="status">{error ? <><p>正文暂时无法载入</p><button onClick={retry}>重新载入</button></> : '正在准备正文…'}</div>}</div></div></dialog>;
}
