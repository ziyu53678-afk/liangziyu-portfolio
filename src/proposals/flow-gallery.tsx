import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, ArrowDown, ArrowRight, X, Play, Maximize2, ExternalLink } from 'lucide-react';
import CountUp from '../components/react-bits/CountUp';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import './flow-gallery.css';
import './flow-type.css';
import { asset } from '../lib/asset';
import { ArticlePreview, ArticleDialog } from './ArticleReader';
import type { ArticleId } from './ArticleReader';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const projects = [
  { name: '热点显微镜', english: 'HotScope', category: '网页产品 / 传播分析', image: 'hotscope.webp', url: 'https://hotscope-weibo.vercel.app/', description: '用可操作的网页，探索微博热搜与传播案例。线上页面名为“热搜显微镜”。' },
  { name: '流年', english: 'Liunian', category: '网页产品 / 个人数据库', image: 'liunian.webp', url: 'https://symphonious-arithmetic-74cf38.netlify.app/', description: '围绕个人数据与成长记录，探索个人数据库的 AI 化。' },
  { name: '微信年度报告', english: 'A year, replayed.', category: '手机网页 / 年度回顾', image: 'replay.webp', url: 'https://2501137682.github.io/WeChat_Replay_2025/', description: '把一年的记录，组织成一段可以滑动浏览的手机网页。', mobile: true },
  { name: '公众号内容工作流', english: 'From idea to draft.', category: 'n8n / 自动化实践', image: 'workflow.webp', description: '从研究、写作、配图到微信草稿创建，串联内容生产流程。', workflow: true },
  { name: '逃离后室', english: 'Into the backrooms.', category: 'Unity / 游戏原型', image: 'backrooms.webp', description: '结合 Unity 与 AI 辅助开发，探索游戏场景和交互。', video: true },
];
type Exhibit = (typeof projects)[number];

function App() {
  const root = useRef<HTMLDivElement>(null);
  const [currentHall, setCurrentHall] = useState('00');
  const [opened, setOpened] = useState<Exhibit | null>(null);
  const [articleOpened, setArticleOpened] = useState<ArticleId | null>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.hero-type .type-inner', { yPercent: 105, stagger: .12, duration: 1.15, ease: 'power3.out' });
      gsap.from('.hero-caption', { opacity: 0, y: 12, duration: .7, delay: .5, clearProps: 'all' });
      gsap.to('.hero-italic', { xPercent: 9, ease: 'none', scrollTrigger: { trigger: '.flow-hero', start: 'top top', end: 'bottom top', scrub: .65 } });
      gsap.to('.hero-sans', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.flow-hero', start: 'top top', end: 'bottom top', scrub: .65 } });
      gsap.to('.hero-images', { xPercent: -16, yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.flow-hero', start: 'top top', end: 'bottom top', scrub: .5 } });
      gsap.to('.ribbon-track', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.flow-ribbon', start: 'top bottom', end: 'bottom top', scrub: .5 } });
    });
    mm.add('(min-width: 801px) and (prefers-reduced-motion: no-preference)', () => {
      const track = root.current!.querySelector<HTMLElement>('.content-track')!;
      const viewport = root.current!.querySelector<HTMLElement>('.content-viewport')!;
      gsap.to(track, {
        x: () => -(track.scrollWidth - viewport.clientWidth), ease: 'none',
        scrollTrigger: { id: 'horizontal-content', trigger: '.content-viewport', start: 'top top', end: () => `+=${Math.max(800, track.scrollWidth - viewport.clientWidth)}`, pin: true, scrub: .65, invalidateOnRefresh: true },
      });
      const stack = gsap.utils.toArray<HTMLElement>('.research-card');
      stack.slice(0, -1).forEach((card, i) => {
        gsap.to(card.querySelector('.research-card-inner'), { scale: .94, ease: 'none', scrollTrigger: { trigger: stack[i + 1], start: 'top 85%', end: 'top 19%', scrub: .4 } });
      });
      const labCards = gsap.utils.toArray<HTMLElement>('.experiment');
      labCards.slice(0, -1).forEach((card, i) => {
        gsap.to(card.querySelector('.experiment-inner'), { scale: .96, ease: 'none', scrollTrigger: { trigger: labCards[i + 1], start: 'top 65%', end: 'top 18%', scrub: .4 } });
      });
    });
    ['00', '01', '02', '03'].forEach(id => {
      ScrollTrigger.create({ trigger: `[data-hall="${id}"]`, start: 'top 85px', end: 'bottom 85px', onEnter: () => setCurrentHall(id), onEnterBack: () => setCurrentHall(id) });
    });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, { scope: root });

  return <div ref={root} className="flow-site">
    <a className="flow-skip" href="#hall-one">跳到作品</a>
    <header className="flow-header" data-current-hall={currentHall}><a className="flow-signature" href="#entrance">梁梓煜<span>Liang Ziyu</span></a><nav aria-label="展厅导览">{[['01', '观察'], ['02', '传播'], ['03', '实验']].map(([id, label]) => <a key={id} href={`#hall-${id === '01' ? 'one' : id === '02' ? 'two' : 'three'}`} aria-current={currentHall === id ? 'location' : undefined}><span>{id}</span>{label}</a>)}</nav><span className="flow-edition">作品数字展 ↘</span></header>
    <main>
      <section className="flow-hero" id="entrance" data-hall="00" aria-labelledby="flow-title">
        <div className="hero-topline"><div className="hero-identity"><span>28届深圳大学网络与新媒体</span><span>个人作品数字展</span></div><span>2025—2026 / SELECTED WORK</span></div>
        <h1 id="flow-title" className="hero-type"><span className="hero-sans"><span className="type-inner">Ideas in</span></span><span className="hero-italic"><span className="type-inner">motion.</span></span><span className="sr-only">梁梓煜：把观察，变成作品。</span></h1>
        <div className="hero-images" aria-hidden="true"><img src={asset('media/hotscope.webp')} alt="" width="1280" height="850" /><img src={asset('media/backrooms.webp')} alt="" width="1000" height="675" /><img src={asset('media/liunian.webp')} alt="" width="1280" height="850" /></div>
        <div className="hero-caption"><div><h2>把观察，<span>变成作品。</span></h2><p>调研与报道 · 内容运营 · AI 产品实践</p></div><a className="enter-link" href="#hall-one"><span>向下，进入展览</span><ArrowDown size={21} /></a><p className="hero-brief">我关注真实世界里的变化，<br />也尝试用内容与技术，做出回应。</p></div>
      </section>

      <section className="research-hall" id="hall-one" data-hall="01" aria-labelledby="research-title">
        <div className="hall-heading"><span className="hall-number">01 / RESEARCH</span><div><h2 id="research-title">观察<span className="serif-cn">与记录</span><em>Look closer.</em></h2><p>走进现场，听见不同的声音。<br />从深圳夜市，到行业中的变化。</p></div><span className="section-count">3 件作品<br />向下翻阅 ↘</span></div>
        <div className="research-stack">
          <article className="research-card"><div className="research-card-inner night-card"><div className="research-copy"><div className="exhibit-meta"><span>01—01 / 团队调研</span><span>2025</span></div><h3>从野蛮生长<br /><span className="serif-cn">到多元共治</span></h3><p className="research-sub">深圳夜市治理模式探索</p><p>参与深圳夜市治理主题调研，<br />团队入选南风窗“调研中国”年度十强。</p><a className="flow-action" href="https://xhslink.cn/o/4JiNoUc0wCH" target="_blank" rel="noreferrer">查看调研项目<ArrowUpRight size={20} /></a><span className="award-type">年度<span>十强</span><small>2025 · 调研中国 / 团队成果</small></span></div><div className="certificate-frame"><img src={asset('media/award.webp')} alt="2025年调研中国年度十强荣誉证书" width="1658" height="1116" loading="lazy" /></div></div></article>
          <article className="research-card"><div className="research-card-inner report-card"><div className="research-copy"><div className="exhibit-meta"><span>01—02 / 报道复盘</span><span>深度训练营</span></div><h3>一篇报道，<br /><span className="serif-cn">如何接近事实？</span></h3><p className="research-sub">瑞幸财务造假案报道复盘</p><p>围绕财务造假案报道展开复盘，<br />对话品玩王兆洋。</p><button className="flow-action" onClick={() => setArticleOpened('luckin')}>展开阅读全文<ArrowUpRight size={20} /></button></div><ArticlePreview id="luckin" onExpand={() => setArticleOpened('luckin')} /></div></article>
          <article className="research-card"><div className="research-card-inner commerce-card"><div className="research-copy"><div className="exhibit-meta"><span>01—03 / 小组深度报道</span><span>行业采访</span></div><h3>AI 时代，<br /><span className="serif-cn">跨境电商已上桌</span></h3><p>通过采访与资料梳理，<br />了解 AI 带来的跨境电商行业变化。</p><button className="flow-action" onClick={() => setArticleOpened('commerce')}>展开阅读全文<ArrowUpRight size={20} /></button></div><ArticlePreview id="commerce" onExpand={() => setArticleOpened('commerce')} /></div></article>
        </div>
      </section>

      <div className="flow-ribbon" aria-hidden="true"><div className="ribbon-track"><span>Stories travel.</span><i>观察之后，开始传播。 ↗</i><span>Stories travel.</span><i>观察之后，开始传播。 ↗</i></div></div>

      <section className="content-hall" id="hall-two" data-hall="02" aria-labelledby="content-title">
        <div className="content-viewport"><div className="content-track">
          <div className="content-intro"><span className="hall-number">02 / CONTENT</span><h2 id="content-title">内容，<br />有<span className="serif-cn">回响。</span></h2><em>Make it<br />resonate.</em><div className="horizontal-cue"><p>个人账号实践<br />与企业内容运营实习</p><span>继续向下滚动 <ArrowRight size={26} /></span></div></div>
          <article className="content-panel fish-panel"><div className="exhibit-meta"><span>02—01 / 独立运营</span><span>无畏契约赛事内容</span></div><div className="fish-main"><div><h3>赛事鱼</h3><p>围绕赛事持续创作，<br />从选题到发布，独立运营自己的内容账号。</p></div><div className="fish-big-stat"><strong><CountUp to={500} suffix="万+" duration={1.25} /></strong><span>累计播放</span></div></div><div className="fish-stats"><div><strong>40+</strong><span>已发布作品</span></div><div><strong>3.3万+</strong><span>视频获赞</span></div><a className="flow-action" href="https://www.douyin.com/user/MS4wLjABAAAAKLcXOLdUjt22_1IrPnYepHyA9DCDpN9NRlBO3KNtWA2noVAzpRnCYRkhKQhEjJYw" target="_blank" rel="noreferrer">访问抖音账号<ArrowUpRight size={21} /></a></div><div className="fish-type" aria-hidden="true">PLAY. REPLAY.</div><small className="data-provenance">运营数据依据个人项目记录</small></article>
          <article className="content-panel gold-panel"><div className="exhibit-meta"><span>02—02 / 内容运营实习</span><span>2026.07—09</span></div><div className="gold-layout"><div><h3>黄金岛</h3><p className="gold-sub">多平台内容矩阵搭建</p><p>深圳风林火山有限公司实习期间，负责棋牌游戏内容运营，参与多平台矩阵从 0 到 1 的搭建。</p><div className="gold-stats"><span><strong>30+</strong>条视频</span><span><strong>10万+</strong>视频播放</span></div></div><figure><img src={asset('media/huangjindao.jpg')} alt="黄金岛账号主页截图" width="1179" height="884" loading="lazy" /></figure></div><small className="data-provenance">运营数据依据个人项目记录</small></article>
        </div></div>
      </section>

      <section className="experiment-hall" id="hall-three" data-hall="03" aria-labelledby="experiment-title">
        <div className="hall-heading lab-heading"><span className="hall-number">03 / EXPERIMENTS</span><div><h2 id="experiment-title">把想法<span className="serif-cn">做出来。</span><em>What if it works?</em></h2><p>网页、自动化与游戏原型。<br />一些好奇，和它们的下一步。</p></div><span className="section-count">5 件作品<br />可展开体验 ↗</span></div>
        <div className="experiment-stack">{projects.map((project, i) => <article className={`experiment experiment-${i}`} key={project.name}><div className="experiment-inner"><SpotlightCard className="experiment-surface" spotlightColor="#c8d9a4" intensity={.1} borderGlow={.1} flare={false}><div className="experiment-info"><div className="exhibit-meta"><span>03—0{i + 1}</span><span>{project.category}</span></div><h3>{project.name}</h3><em>{project.english}</em><p>{project.description}</p><button className="flow-action" onClick={() => setOpened(project)}>{project.video ? '播放演示' : project.workflow ? '查看工作流' : '进入作品'}{project.video ? <Play size={19} /> : <ArrowUpRight size={21} />}</button><span className="experiment-footer">{project.url ? '真实网页 · 点击后载入' : project.video ? '游戏实际运行录屏' : '研究 → 写作 → 配图 → 创建草稿'}</span></div><button className={`experiment-window ${project.mobile ? 'is-phone' : ''}`} onClick={() => setOpened(project)} aria-label={`展开${project.name}`}><div className="window-top"><span><i /><i /><i /></span><span>{project.video ? 'UNITY DEMO' : project.workflow ? 'N8N WORKFLOW' : 'WEB EXPERIMENT'}</span><Maximize2 size={14} /></div><img src={asset(`media/${project.image}`)} alt={`${project.name}真实素材`} loading="lazy" width={project.mobile ? '390' : '1280'} height={project.mobile ? '844' : '850'} /><span className="window-hover">{project.video ? '播放演示' : project.workflow ? '展开工作流' : '展开交互'}<ArrowUpRight size={19} /></span></button></SpotlightCard></div></article>)}</div>
        <div className="flow-ending"><em>Still in motion.</em><a href="#entrance">回到展览入口<ArrowUpRight size={21} /></a><div><span>梁梓煜 · 个人作品集</span><span>2026 / SELECTED WORK</span></div></div>
      </section>
    </main>
    {opened && <ExhibitViewer project={opened} onClose={() => setOpened(null)} />}
    {articleOpened && <ArticleDialog id={articleOpened} onClose={() => setArticleOpened(null)} />}
  </div>;
}

function ExhibitViewer({ project, onClose }: { project: Exhibit; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const el = dialog.current!;
    const last = document.activeElement as HTMLElement | null;
    el.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; last?.focus(); };
  }, []);
  return <dialog className="exhibit-viewer" ref={dialog} onCancel={onClose} aria-label={project.name} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="viewer-shell"><header><div><span>{project.category}</span><h2>{project.name}</h2></div><div>{project.url && <a href={project.url} target="_blank" rel="noreferrer">新窗口打开<ExternalLink size={17} /></a>}<button onClick={onClose} aria-label="关闭作品"><X size={23} /></button></div></header><div className="viewer-content">{project.url ? <><p className="viewer-status">{loaded ? '已载入 · 可点击、输入与滚动操作' : '正在载入真实作品…'}</p><iframe className={project.mobile ? 'mobile-embed' : ''} src={project.url} title={`${project.name}实时体验`} onLoad={() => setLoaded(true)} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads" allow="fullscreen" /></> : project.video ? <video src={asset('media/backrooms.mp4')} controls autoPlay playsInline poster={asset('media/backrooms.webp')} /> : <><div className="workflow-nodes">{['主题研究', '文章写作', '图片生成', '微信草稿'].map((step, i) => <React.Fragment key={step}><span>{step}</span>{i < 3 && <ArrowRight size={20} />}</React.Fragment>)}</div><p>实际工作流截图</p><img src={asset('media/workflow.webp')} alt="研究、写作、配图、素材上传与公众号草稿创建的n8n流程截图" /></>}</div></div></dialog>;
}

createRoot(document.getElementById('root')!).render(<App />);
