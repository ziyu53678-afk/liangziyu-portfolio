import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, ArrowRight, ArrowDown, X, Menu, Play, ExternalLink, Microscope, Database, MessageCircle, Workflow, Gamepad2, Search, PenLine, Image, Send, Award, Maximize2, RotateCcw, ChevronRight, FileText, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SplitText from './components/react-bits/SplitText';
import CountUp from './components/react-bits/CountUp';
import SpotlightCard from './components/react-bits/SpotlightCard';

gsap.registerPlugin(useGSAP);

const media = (name: string) => `${import.meta.env.BASE_URL}media/${name}`;
const links = {
  night: 'https://xhslink.cn/o/4JiNoUc0wCH',
  nightMore: 'https://xhslink.cn/o/6KeRWaiXAgh',
  luckin: 'https://mp.weixin.qq.com/s/LaehjGpxzTCFKVTAbB9UkQ',
  ecommerce: 'https://mp.weixin.qq.com/s/O2ZuGYDufqQQFU5wN1HRiQ',
  douyin: 'https://www.douyin.com/user/MS4wLjABAAAAKLcXOLdUjt22_1IrPnYepHyA9DCDpN9NRlBO3KNtWA2noVAzpRnCYRkhKQhEjJYw',
  hotscope: 'https://hotscope-weibo.vercel.app/',
  liunian: 'https://symphonious-arithmetic-74cf38.netlify.app/',
  replay: 'https://2501137682.github.io/WeChat_Replay_2025/',
};

type ProjectId = 'night' | 'fish' | 'internship' | 'hotscope' | 'liunian' | 'replay' | 'workflow' | 'game';
type Project = { title: string; eyebrow: string; description: string; url?: string; mobile?: boolean; icon: LucideIcon };
const projects: Record<ProjectId, Project> = {
  night: { title: '深圳夜市治理模式探索', eyebrow: '调研中国 · 2025', description: '《从野蛮生长到多元共治：深圳夜市治理模式探索》。团队参与南风窗 2025 年“调研中国”青年领导力公益计划，获评年度十强团队之一。', url: links.night, icon: Award },
  fish: { title: '赛事鱼', eyebrow: '独立运营 · 无畏契约', description: '独立运营的无畏契约赛事内容账号，已发布 40 多个作品，累计播放 500 多万、获赞 3.3 万多。', url: links.douyin, icon: Play },
  internship: { title: '黄金岛内容运营', eyebrow: '深圳风林火山有限公司 · 2026.07—2026.09', description: '实习期间负责黄金岛棋牌游戏的内容运营，参与多平台内容矩阵从 0 到 1 的搭建，发布 30 多条视频，视频播放量 10 万多。', icon: MessageCircle },
  hotscope: { title: '热点显微镜', eyebrow: '网页产品 · AI 辅助开发', description: '基于微博热搜与传播案例数据的分析平台。线上产品页面名为“热搜显微镜”，可以在这里直接体验。', url: links.hotscope, icon: Microscope },
  liunian: { title: '流年', eyebrow: '个人数据库 · AI 辅助开发', description: '围绕个人数据与成长记录展开的网页产品实践，探索个人数据库的 AI 化。', url: links.liunian, icon: Database },
  replay: { title: '微信年度报告', eyebrow: 'WeChat Replay · 2025', description: '为手机屏幕设计的年度回顾网页。可在下方手机窗口中浏览，也可以在新窗口打开。', url: links.replay, mobile: true, icon: MessageCircle },
  workflow: { title: '微信公众号内容工作流', eyebrow: 'n8n · 自动化实践', description: '把研究、写作、配图与微信草稿创建串联成一个工作流。选择下方节点，查看每一步的作用。', icon: Workflow },
  game: { title: '逃离后室', eyebrow: 'Unity · 游戏 Demo', description: '结合 Unity 与 AI 辅助开发完成的游戏原型。这是一段实际运行录屏，可播放查看场景与交互。', icon: Gamepad2 },
};

const steps: { title: string; subtitle: string; detail: string; input: string; output: string; icon: LucideIcon }[] = [
  { title: '研究', subtitle: 'Research Agent', detail: 'Research Agent 根据输入主题组织研究内容，为后续写作提供材料。', input: '主题与任务字段', output: '供写作使用的研究材料', icon: Search },
  { title: '写作', subtitle: 'Writer Agent', detail: 'Writer Agent 接收研究材料，借助结构化输出解析器整理文章内容。', input: '前一步的研究材料', output: '结构化文章内容', icon: PenLine },
  { title: '配图', subtitle: 'Image Agent', detail: '配图 Agent 生成图片提示词，通过图像接口获取图片并下载到后续步骤。', input: '文章与图片提示词', output: '可上传的配图文件', icon: Image },
  { title: '创建草稿', subtitle: 'WeChat Draft', detail: '将图片上传至微信素材库，再把文章与素材组合成公众号草稿。', input: '文章内容与图片素材', output: '微信公众号草稿', icon: Send },
];

function OutLink({ href, children, className = 'text-link' }: { href: string; children: React.ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={17} aria-hidden="true" /></a>;
}

function SectionHead({ number, title, english, children, dark = false }: { number: string; title: string; english: string; children: React.ReactNode; dark?: boolean }) {
  return <div className={`section-heading ${dark ? 'on-dark' : ''}`}>
    <div><div className="section-label"><span>{number}</span><span>{english}</span></div><h2 id={`section-${number}`}>{title}<span className="blue-dot">.</span></h2></div>
    <p>{children}</p>
  </div>;
}

function App() {
  const root = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('');
  const [selected, setSelected] = useState<ProjectId | null>(null);
  const close = useCallback(() => setSelected(null), []);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.hero-reveal', { y: 14, opacity: 0, duration: .65, stagger: .08, delay: .2, ease: 'power2.out', clearProps: 'all' });
      gsap.from('.hero-visual', { scale: .98, duration: 1, ease: 'power2.out', clearProps: 'transform' });
    });
    return () => mm.revert();
  }, { scope: root });

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActiveNav(entry.target.id);
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const navigate = () => setMenuOpen(false);
  return <div ref={root}>
    <header className="site-header">
      <div className="wrap header-inner">
        <a className="skip-link" href="#main">跳到主要内容</a>
        <a className="wordmark" href="#home" aria-label="梁梓煜，返回首页"><span className="brand-mark" aria-hidden="true">L.</span><span>梁梓煜<span className="wordmark-en">Liang Ziyu</span></span></a>
        <nav id="mobile-navigation" aria-label="主导航" className={menuOpen ? 'is-open' : ''}>
          {[['research', '调研与报道'], ['content', '内容运营'], ['lab', '产品实验']].map(([id, label], index) => <a key={id} onClick={navigate} href={`#${id}`} aria-current={activeNav === id ? 'location' : undefined}><span className="nav-number">0{index + 1}</span>{label}</a>)}
        </nav>
        <span className="header-note">个人作品集 <span>2026</span></span>
        <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? '关闭导航' : '打开导航'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
    </header>

    <main id="main" tabIndex={-1}>
      <section id="home" className="hero" data-enter aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <div className="eyebrow hero-reveal"><span className="tiny-square" />个人作品集 <span className="eyebrow-divider" />2025—2026</div>
            <h1 id="hero-title"><span className="hero-intro">你好，我是</span><SplitText text="梁梓煜" tag="span" className="hero-name" trigger="load" splitType="chars" duration={.7} delay={85} from={{ y: 42, opacity: 0 }} to={{ y: 0, opacity: 1 }} textAlign="left" /></h1>
            <p className="hero-statement hero-reveal">调研、内容运营<br />与 <span>AI 产品实践</span><span className="blue-dot">.</span></p>
            <p className="hero-description hero-reveal">参与采访与深度报道，独立运营赛事账号，<br className="desktop-break" />也用 AI 把想法做成网页产品和自动化工作流。</p>
            <div className="button-row hero-reveal"><a className="btn btn-primary" href="#research">查看作品<ArrowDown size={17} /></a><a className="btn btn-secondary" href="#lab">体验产品<ArrowUpRight size={17} /></a></div>
          </div>
          <div className="hero-visual" aria-label="作品预览">
            <div className="visual-topline"><span>作品切片</span><span>Selected work ↗</span></div>
            <button className="hero-browser" onClick={() => setSelected('hotscope')} aria-label="体验热点显微镜">
              <div className="browser-chrome"><div className="window-dots"><i /><i /><i /></div><span>热搜显微镜</span><ArrowUpRight size={14} /></div>
              <img src={media('hotscope.webp')} alt="热搜显微镜真实网页界面" fetchPriority="high" width="1280" height="850" />
              <span className="preview-action">体验产品 <ArrowUpRight size={14} /></span>
            </button>
            <div className="hero-bottom-grid">
              <button className="hero-mini game-mini" onClick={() => setSelected('game')} aria-label="播放逃离后室演示"><img src={media('backrooms.webp')} alt="Unity 后室游戏实际运行画面" width="640" height="430" /><span><Gamepad2 size={16} />Unity 实践 <ArrowUpRight size={14} /></span></button>
              <button className="hero-mini award-mini" onClick={() => setSelected('night')} aria-label="查看调研中国年度十强项目"><div className="mini-award-art"><Award size={35} strokeWidth={1.2} /><strong>年度十强</strong><small>2025 · 调研中国</small></div><span>调研与报道 <ArrowUpRight size={14} /></span></button>
            </div>
          </div>
          <div className="hero-foot hero-reveal"><span>阅读作品，也可以直接体验。</span><a href="#research" aria-label="向下查看调研与报道"><span>向下浏览</span><ArrowDown size={16} /></a></div>
        </div>
      </section>

      <section id="research" className="research-section page-section" aria-labelledby="section-01">
        <div className="wrap">
          <SectionHead number="01" title="调研与报道" english="Research & stories">从深圳夜市到跨境电商，<br />通过采访和资料梳理，理解行业中的变化。</SectionHead>
          <article className="research-feature">
            <div className="feature-copy">
              <div className="project-kicker"><span className="tag tag-blue">年度十强</span><span>南风窗 · 调研中国 · 2025</span></div>
              <h3 id="research-heading">从野蛮生长<br />到多元共治</h3>
              <p className="feature-subtitle">深圳夜市治理模式探索</p>
              <p>参与深圳夜市治理主题调研，<br />团队入选 2025 年“调研中国”年度十强。</p>
              <button className="text-link" onClick={() => setSelected('night')}>查看调研项目<ArrowUpRight size={18} /></button>
              <div className="project-meta"><span>团队调研</span><span>城市观察</span></div>
            </div>
            <button className="award-display" onClick={() => setSelected('night')} aria-label="放大查看年度十强荣誉证书"><img src={media('award.webp')} alt="2025年调研中国年度十强荣誉证书，项目为深圳夜市治理模式探索" width="1658" height="1116" loading="lazy" /><span className="image-expand"><Maximize2 size={18} /></span></button>
          </article>
          <div className="article-grid">
            <article className="article-card"><div className="article-art luckin-art" aria-hidden="true"><span className="art-index">01 / 深度训练营</span><div><span>瑞幸财务造假案</span><strong>报道复盘</strong></div><span className="art-foot">对话品玩王兆洋 <ArrowUpRight size={25} /></span></div><div className="article-body"><div className="project-kicker">深度训练营 · 报道复盘</div><h3>瑞幸财务造假案报道复盘</h3><p>围绕财务造假案报道展开复盘，对话品玩王兆洋。</p><OutLink href={links.luckin}>阅读报道</OutLink></div></article>
            <article className="article-card"><div className="article-art commerce-art" aria-hidden="true"><span className="art-index">02 / 小组深度报道</span><div><span>AI 时代</span><strong>跨境电商已上桌</strong></div><span className="art-foot">AI × 跨境电商 <ArrowUpRight size={25} /></span></div><div className="article-body"><div className="project-kicker">小组作品 · 行业采访</div><h3>AI时代，跨境电商已上桌</h3><p>通过采访了解 AI 带来的跨境电商行业变化。</p><OutLink href={links.ecommerce}>阅读报道</OutLink></div></article>
          </div>
        </div>
      </section>

      <section id="content" className="content-section page-section" aria-labelledby="section-02">
        <div className="wrap">
          <SectionHead number="02" title="内容运营" english="Content & growth">一段个人账号实践，<br />一段企业内容运营实习。</SectionHead>
          <article className="fish-project">
            <div className="fish-top"><div><div className="project-kicker">个人账号 · 独立运营</div><h3 id="content-heading">赛事鱼<span>无畏契约赛事内容</span></h3></div><OutLink href={links.douyin} className="btn btn-secondary">访问抖音账号</OutLink></div>
            <div className="stats-grid">
              <div><strong><CountUp to={40} duration={1.2} suffix="+" /></strong><span>已发布作品</span></div>
              <div><strong><CountUp to={500} duration={1.2} suffix="万+" /></strong><span>累计播放</span></div>
              <div><strong><CountUp to={3.3} decimals={1} duration={1.2} suffix="万+" /></strong><span>视频获赞</span></div>
            </div>
            <div className="fish-bottom"><p>围绕无畏契约赛事持续创作，<br />从选题到发布，独立运营自己的内容账号。</p><button className="text-link" onClick={() => setSelected('fish')}>查看运营案例<ArrowUpRight size={18} /></button><span className="fish-word" aria-hidden="true">赛事鱼<span>↗</span></span></div>
          </article>
          <article className="internship-project">
            <div className="internship-copy"><div className="project-kicker"><span className="tag">内容运营实习</span><span>2026.07—2026.09</span></div><h3>黄金岛<span>多平台内容矩阵搭建</span></h3><p>深圳风林火山有限公司实习期间，负责黄金岛棋牌游戏的内容运营，参与多平台矩阵从 0 到 1 的搭建。</p><div className="internship-results"><span><strong>30+</strong> 条视频</span><span><strong>10万+</strong> 视频播放</span></div><button className="text-link" onClick={() => setSelected('internship')}>查看实习案例<ArrowUpRight size={18} /></button></div>
            <button className="account-display" onClick={() => setSelected('internship')} aria-label="查看黄金岛账号与实习案例"><img src={media('huangjindao.jpg')} alt="实习运营对象黄金岛的账号主页截图" width="1179" height="884" loading="lazy" /><span className="account-label"><MessageCircle size={17} />黄金岛 · 账号页面<ArrowUpRight size={16} /></span></button>
          </article>
          <p className="data-note">运营数据依据个人项目记录，详见账号与案例。</p>
        </div>
      </section>

      <section id="lab" className="lab-section page-section" aria-labelledby="section-03">
        <div className="wrap">
          <SectionHead number="03" title="产品实验室" english="Built with curiosity" dark>用 AI 辅助开发，<br />把想法做成可以操作和体验的作品。</SectionHead>
          <div className="lab-intro"><h3 id="lab-heading">想法的下一步，<br /><span>是把它做出来。</span></h3><div><span className="lab-status"><span />5 个产品与实践项目</span><p>网页产品 / 游戏原型 / 自动化</p></div></div>
          <div className="product-grid">
            <ProductCard id="hotscope" number="01" title="热点显微镜" subtitle="微博热搜与传播案例分析" image="hotscope.webp" icon={Microscope} onOpen={setSelected} />
            <ProductCard id="liunian" number="02" title="流年" subtitle="个人数据库与成长记录" image="liunian.webp" icon={Database} onOpen={setSelected} />
          </div>
          <div className="lab-small-grid">
            <SpotlightCard className="lab-small-card replay-card" spotlightColor="#5f7dff" intensity={.12} flare={false}>
              <div className="small-project-top"><span className="project-number">03 / Mobile web</span><MessageCircle size={21} /></div>
              <button className="replay-preview" onClick={() => setSelected('replay')} aria-label="体验微信年度报告"><div className="phone"><div className="phone-island" /><img src={media('replay.webp')} alt="微信年度报告真实手机网页界面" width="390" height="844" loading="lazy" /></div></button>
              <div className="small-project-copy"><h3>微信年度报告</h3><p>为手机屏幕设计的年度回顾网页。</p><button className="text-link" onClick={() => setSelected('replay')}>体验年度报告<ArrowUpRight size={17} /></button></div>
            </SpotlightCard>
            <SpotlightCard className="lab-small-card workflow-card" spotlightColor="#5f7dff" intensity={.12} flare={false}>
              <div className="small-project-top"><span className="project-number">04 / Automation</span><Workflow size={21} /></div>
              <button className="workflow-preview" onClick={() => setSelected('workflow')} aria-label="查看微信公众号工作流"><div className="workflow-node"><Search size={22} /><span>研究</span></div><ChevronRight className="flow-arrow" size={18} /><div className="workflow-node"><PenLine size={22} /><span>写作</span></div><ChevronRight className="flow-arrow" size={18} /><div className="workflow-node"><Send size={22} /><span>草稿</span></div><span className="workflow-caption">n8n × AI Agents</span></button>
              <div className="small-project-copy"><h3>公众号内容工作流</h3><p>从主题研究、写作、配图到创建草稿。</p><button className="text-link" onClick={() => setSelected('workflow')}>查看工作流<ArrowUpRight size={17} /></button></div>
            </SpotlightCard>
            <SpotlightCard className="lab-small-card game-card" spotlightColor="#5f7dff" intensity={.12} flare={false}>
              <div className="small-project-top"><span className="project-number">05 / Unity demo</span><Gamepad2 size={21} /></div>
              <button className="game-preview" onClick={() => setSelected('game')} aria-label="播放逃离后室演示" onMouseEnter={e => { if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover:hover)').matches) return; const v = e.currentTarget.querySelector('video'); void v?.play().catch(() => {}); }} onMouseLeave={e => { const v = e.currentTarget.querySelector('video'); if (v) { v.pause(); v.currentTime = 0; } }}><video muted playsInline preload="none" poster={media('backrooms.webp')} src={media('backrooms.mp4')} aria-label="逃离后室游戏预览" /><span className="video-play"><Play size={19} fill="currentColor" /></span><span className="video-duration">00:23</span></button>
              <div className="small-project-copy"><h3>逃离后室</h3><p>结合 Unity 与 AI 辅助开发的游戏原型。</p><button className="text-link" onClick={() => setSelected('game')}>播放演示<ArrowUpRight size={17} /></button></div>
            </SpotlightCard>
          </div>
          <div className="lab-end"><span>研究、创作、动手实践。</span><a href="#home">回到顶部<ArrowRight size={17} className="up-arrow" /></a></div>
        </div>
      </section>
    </main>
    <footer className="site-footer"><div className="wrap"><span>梁梓煜 · 个人作品集</span><span>2026</span></div></footer>
    {selected && <ProjectDialog id={selected} onClose={close} />}
  </div>;
}

function ProductCard({ id, number, title, subtitle, image, icon: Icon, onOpen }: { id: ProjectId; number: string; title: string; subtitle: string; image: string; icon: LucideIcon; onOpen: (id: ProjectId) => void }) {
  return <SpotlightCard className="product-card" spotlightColor="#5f7dff" intensity={.12} borderGlow={.45} flare={false}>
    <div className="product-card-top"><span className="project-number">{number} / Web application</span><Icon size={22} /></div>
    <button className="product-screen" onClick={() => onOpen(id)} aria-label={`体验${title}`}><div className="browser-chrome dark-chrome"><div className="window-dots"><i /><i /><i /></div><span>{title}</span><Maximize2 size={12} /></div><img src={media(image)} alt={`${title}真实网页界面`} width="1280" height="850" loading="lazy" /><span className="screen-play"><Maximize2 size={18} />展开体验</span></button>
    <div className="product-card-bottom"><div><h3>{title}</h3><p>{subtitle}</p></div><button className="round-button" aria-label={`打开${title}交互窗口`} onClick={() => onOpen(id)}><ArrowUpRight size={22} /></button></div>
  </SpotlightCard>;
}

function ProjectDialog({ id, onClose }: { id: ProjectId; onClose: () => void }) {
  const project = projects[id];
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [frameKey, setFrameKey] = useState(0);
  const [slow, setSlow] = useState(false);
  const embedded = id === 'hotscope' || id === 'liunian' || id === 'replay';
  const Icon = project.icon;

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; element?.close(); previousFocus?.focus({ preventScroll: true }); };
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setSlow(true), 10000);
    return () => window.clearTimeout(timer);
  }, [frameKey, loading]);

  return <dialog ref={dialog} className={`project-dialog ${embedded ? 'embed-dialog' : ''} ${project.mobile ? 'mobile-dialog' : ''}`} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === dialog.current) onClose(); }} aria-labelledby="dialog-title" aria-describedby="dialog-description">
    <div className="dialog-panel">
      <div className="dialog-toolbar"><div className="dialog-title-group"><span className="dialog-icon"><Icon size={20} /></span><div><span className="dialog-eyebrow">{project.eyebrow}</span><h2 id="dialog-title">{project.title}</h2></div></div><div className="dialog-actions">{embedded && <button className="icon-button reload-button" aria-label="重新加载产品" onClick={() => { setLoading(true); setSlow(false); setFrameKey(k => k + 1); }}><RotateCcw size={18} /></button>}{project.url && <OutLink href={project.url} className="dialog-external"><span>{embedded ? '新窗口打开' : '查看原始作品'}</span><ExternalLink size={16} /></OutLink>}<button autoFocus className="icon-button close-button" aria-label="关闭项目窗口" onClick={onClose}><X size={23} /></button></div></div>
      <div className={`dialog-body ${embedded ? 'embed-body' : ''}`} ref={body}>
        {embedded ? <><div className="embed-description" id="dialog-description"><p>{project.description}</p><span>{loading ? (slow ? '加载时间较长，可在新窗口打开' : '正在载入产品…') : '已载入 · 可直接点击与操作'}</span></div><div className={`iframe-stage ${project.mobile ? 'phone-stage' : ''}`}><iframe key={frameKey} src={project.url} title={`${project.title}在线交互体验`} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads" referrerPolicy="strict-origin-when-cross-origin" allow="fullscreen" onLoad={() => setLoading(false)} onError={() => setSlow(true)} /></div><p className="embed-help">在线内容由原产品提供。如果无法正常显示，使用顶部“新窗口打开”。</p></> : <>
          <p className="detail-description" id="dialog-description">{project.description}</p>
          {id === 'night' && <><img className="detail-award" src={media('award.webp')} alt="深圳夜市治理模式探索团队获评2025年调研中国年度十强的证书" /><div className="detail-facts"><div><span>主办方</span><strong>南风窗</strong></div><div><span>项目形式</span><strong>团队调研</strong></div><div><span>成果</span><strong>年度十强</strong></div></div><div className="detail-links"><OutLink href={links.night}>查看项目视频</OutLink><OutLink href={links.nightMore}>查看相关图文</OutLink></div></>}
          {id === 'fish' && <><div className="case-summary"><span>赛事鱼</span><strong>持续关注<br />无畏契约赛事。</strong><p>个人账号 / 独立运营</p></div><div className="detail-facts"><div><span>发布作品</span><strong>40+</strong></div><div><span>累计播放</span><strong>500万+</strong></div><div><span>视频获赞</span><strong>3.3万+</strong></div></div><h3>我的工作</h3><p>围绕无畏契约赛事开展个人内容创作与账号运营。具体作品和更新记录可在抖音账号查看。</p><OutLink href={links.douyin}>访问赛事鱼账号</OutLink><p className="detail-note">以上为个人项目记录中的累计数据。</p></>}
          {id === 'internship' && <><div className="detail-facts"><div><span>实习时间</span><strong>2026.07—09</strong></div><div><span>发布视频</span><strong>30+</strong></div><div><span>视频播放</span><strong>10万+</strong></div></div><h3>工作内容</h3><p>负责黄金岛棋牌游戏的内容运营，参与多平台内容矩阵从 0 到 1 的建立。</p><img className="detail-account" src={media('huangjindao.jpg')} alt="黄金岛账号主页" /></>}
          {id === 'workflow' && <WorkflowDetail />}
          {id === 'game' && <video className="detail-video" controls playsInline preload="metadata" poster={media('backrooms.webp')} src={media('backrooms.mp4')} aria-label="Unity逃离后室运行演示视频">你的浏览器不支持视频播放。<a href={media('backrooms.mp4')}>下载演示视频</a></video>}
        </>}
      </div>
    </div>
  </dialog>;
}

function WorkflowDetail() {
  const [step, setStep] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const detail = steps[step];
  const DetailIcon = detail.icon;
  useGSAP(() => {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.from('.workflow-info', { opacity: .3, y: 6, duration: .25, clearProps: 'all' });
  }, { scope: container, dependencies: [step] });
  return <div ref={container}>
    <div className="workflow-steps" role="tablist" aria-label="工作流步骤">{steps.map((item, i) => <button key={item.title} role="tab" id={`workflow-tab-${i}`} aria-selected={step === i} aria-controls="workflow-panel" tabIndex={step === i ? 0 : -1} onClick={() => setStep(i)} onKeyDown={e => { if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : (step + (e.key === 'ArrowRight' ? 1 : 3)) % 4; setStep(next); (e.currentTarget.parentElement?.children[next] as HTMLElement)?.focus(); } }}><item.icon size={23} /><span>{item.title}</span>{i < step && <Check className="step-check" size={13} />}</button>)}</div>
    <div className="workflow-info" role="tabpanel" id="workflow-panel" aria-labelledby={`workflow-tab-${step}`}><div className="workflow-info-heading"><DetailIcon size={22} /><div><h3>{detail.title}</h3><span>{detail.subtitle}</span></div></div><p>{detail.detail}</p><dl><div><dt>输入</dt><dd>{detail.input}</dd></div><div><dt>输出</dt><dd>{detail.output}</dd></div></dl></div>
    <h3 className="workflow-source-title">实际工作流</h3><a href={media('workflow.png')} target="_blank" rel="noopener noreferrer" className="workflow-original" aria-label="新窗口查看原始n8n工作流截图"><img src={media('workflow.webp')} alt="n8n微信公众号内容工作流原始截图：研究、写作、图片提示词、图片生成与下载、微信素材上传及草稿创建" /></a>
  </div>;
}

export default App;
