// ===== Global State =====
let LANG = 'en';
let DARK = false;
let Q = [];         // questions
let TYPES = {};     // types data
let idx = 0;
const answers = [];              // stores +2,+1,-1,-2 for each question
const score = { I:0,E:0,N:0,S:0,T:0,F:0,J:0,P:0 };

// ===== Elements =====
const $ = id => document.getElementById(id);
const el = {
  startScreen: $('start-screen'), startDesc: $('start-desc'), startBtn: $('start-btn'),
  quizScreen: $('quiz-screen'), qText: $('question-text'), opts: $('options'),
  counter: $('counter'), nextBtn: $('next-btn'), prevBtn: $('prev-btn'),
  resultScreen: $('result-screen'), resTitle: $('result-title'), resCode: $('result-code'),
  resSummary: $('result-summary'), bars: $('bars'),
  whoTitle: $('who-title'), whoList: $('who-list'),
  shareTitle: $('share-title'), shareWA: $('share-wa'), shareX: $('share-x'),
  retry: $('retry-btn'), nextLabel:$('nextLabel'), prevLabel:$('prevLabel'),
  title: $('title'), subtitle: $('subtitle'),
  footer: $('footer-text'),
  progressFill: $('progress-fill'),
  langAr: $('lang-ar'), langEn: $('lang-en'),
  theme: $('theme-toggle'), dichTitle: $('dich-title')
};

// ===== Translations =====
const TX = {
  en: {
    title:"MBTI Personality Test",
    subtitle:"Discover your MBTI type in minutes",
    startDesc:"35 concise questions • 4 choices • No right or wrong answers.",
    startBtn:"Start Test",
    next:"Next", back:"Back", getResult:"Get Result", retry:"Restart",
    share:"Share your result", famous:"Famous with this type", axes:"Your preferences",
    labels:{I:"Introversion",E:"Extraversion",N:"Intuition",S:"Sensing",T:"Thinking",F:"Feeling",J:"Judging",P:"Perceiving"},
    footer:"Made by Hassan Hadi"
  },
  ar: {
    title:"اختبار شخصيات MBTI",
    subtitle:"اكتشف نوع شخصيتك خلال دقائق",
    startDesc:"35 سؤالًا مختصرًا • 4 اختيارات • لا إجابة صحيحة أو خاطئة.",
    startBtn:"ابدأ الاختبار",
    next:"التالي", back:"رجوع", getResult:"أظهِر النتيجة", retry:"إعادة الاختبار",
    share:"شارك نتيجتك", famous:"شخصيات مع هذا النمط", axes:"ميولك في الأبعاد",
    labels:{I:"انطوائية",E:"انبساط",N:"حدس",S:"حسي",T:"تفكير",F:"مشاعر",J:"حُكم",P:"إدراك"},
    footer:"صنع بواسطة حسن هادي"
  }
};

// ===== Init =====
(async function init(){
  // load data
  [Q, TYPES] = await Promise.all([
    fetch('questions.json').then(r=>r.json()),
    fetch('types.json').then(r=>r.json())
  ]);

  // saved prefs
  LANG = localStorage.getItem('mbti_lang') || 'en';
  DARK = localStorage.getItem('mbti_theme') === 'dark';
  document.body.classList.toggle('dark', DARK);
  el.theme.textContent = DARK ? '☀️' : '🌙';

  // wire
  $('start-btn').onclick = startTest;
  el.nextBtn.onclick = next;
  el.prevBtn.onclick = prev;
  el.retry.onclick = ()=>{ el.resultScreen.classList.add('hidden'); el.startScreen.classList.remove('hidden'); };
  el.langAr.onclick = ()=>setLang('ar');
  el.langEn.onclick = ()=>setLang('en');
  el.theme.onclick = toggleTheme;
  el.shareWA.onclick = shareWA;
  el.shareX.onclick = shareX;

  renderStatic();
})();

// ===== UI Texts =====
function renderStatic(){
  const T = TX[LANG];
  $('title').textContent = T.title;
  $('subtitle').textContent = T.subtitle;
  $('start-desc').textContent = T.startDesc;
  $('start-btn').textContent = T.startBtn;
  $('nextLabel').textContent = T.next;
  $('prevLabel').textContent = T.back;
  $('retry-btn').textContent = T.retry;
  $('who-title').textContent = T.famous;
  $('share-title').textContent = T.share;
  $('dich-title').textContent = T.axes;
  $('footer-text').textContent = T.footer;

  el.langAr.classList.toggle('active', LANG==='ar');
  el.langEn.classList.toggle('active', LANG==='en');
  document.dir = (LANG==='ar') ? 'rtl' : 'ltr';
}

// ===== Start / Navigation =====
function startTest(){
  idx = 0;
  answers.length = 0;
  for (const k in score) score[k]=0;
  el.startScreen.classList.add('hidden');
  el.resultScreen.classList.add('hidden');
  el.quizScreen.classList.remove('hidden');
  renderQuestion();
}

function renderQuestion(){
  const q = Q[idx];
  el.counter.textContent = `${idx+1} / ${Q.length}`;
  el.qText.textContent = q[LANG].text;

  // options
  const labels = q[LANG].choices; // 4
  el.opts.innerHTML = '';
  const vals = [2,1,-1,-2]; // SA, A, D, SD
  labels.forEach((txt,i)=>{
    const b = document.createElement('div');
    b.className = 'opt';
    b.textContent = txt;
    b.dataset.v = vals[i];
    b.onclick = ()=>selectOpt(b);
    el.opts.appendChild(b);
  });

  // restore selection
  const saved = answers[idx];
  if (saved != null) {
    [...el.opts.children].forEach(x => {
      if (+x.dataset.v === saved) x.classList.add('sel');
    });
  }

  // progress
  const p = Math.round((idx)/Q.length*100);
  el.progressFill.style.width = p + '%';

  // buttons
  el.prevBtn.disabled = idx===0;
  el.nextBtn.textContent = (idx===Q.length-1) ? TX[LANG].getResult : TX[LANG].next;
}

function selectOpt(div){
  [...el.opts.children].forEach(x=>x.classList.remove('sel'));
  div.classList.add('sel');
}

function next(){
  const sel = el.opts.querySelector('.sel');
  if(!sel){ alert(LANG==='ar'?'اختر إجابة':'Pick an answer'); return; }

  const v = +sel.dataset.v;              // +2/+1/-1/-2
  answers[idx] = v;

  // apply to dimension
  const d = Q[idx].dim;                  // "I","E","N","S","T","F","J","P"
  const opp = {I:'E',E:'I',N:'S',S:'N',T:'F',F:'T',J:'P',P:'J'}[d];
  if (v>0) score[d]+=v; else score[opp]+=(-v);

  idx++;
  if (idx < Q.length) renderQuestion();
  else showResult();
}

function prev(){
  if(idx===0) return;
  idx--;
  renderQuestion();
}

// ===== Result =====
function codeFromScores(){
  const IvsE = (score.I>=score.E) ? 'I':'E';
  const NvsS = (score.N>=score.S) ? 'N':'S';
  const TvsF = (score.T>=score.F) ? 'T':'F';
  const JvsP = (score.J>=score.P) ? 'J':'P';
  return IvsE+NvsS+TvsF+JvsP;
}

function showBars(){
  const totalIE = score.I + score.E || 1;
  const totalNS = score.N + score.S || 1;
  const totalTF = score.T + score.F || 1;
  const totalJP = score.J + score.P || 1;
  const LBL = TX[LANG].labels;

  el.bars.innerHTML = [
    bar(`${LBL.I} / ${LBL.E}`, Math.round(score[(score.I>=score.E)?'I':'E']/totalIE*100)),
    bar(`${LBL.N} / ${LBL.S}`, Math.round(score[(score.N>=score.S)?'N':'S']/totalNS*100)),
    bar(`${LBL.T} / ${LBL.F}`, Math.round(score[(score.T>=score.F)?'T':'F']/totalTF*100)),
    bar(`${LBL.J} / ${LBL.P}`, Math.round(score[(score.J>=score.P)?'J':'P']/totalJP*100)),
  ].join('');
}

function bar(label, pct){
  return `<div class="muted" style="display:flex;justify-content:space-between"><span>${label}</span><span>${pct}%</span></div>
          <div class="bar"><div class="barin" style="width:${pct}%"></div></div>`;
}

function showResult(){
  el.quizScreen.classList.add('hidden');
  el.resultScreen.classList.remove('hidden');

  const code = codeFromScores();
  const info = TYPES[code] || TYPES['INTJ'];

  const title = `${code} — ${LANG==='ar'?info.name_ar:info.name_en}`;
  const summary = LANG==='ar' ? info.desc_ar : info.desc_en;

  el.resTitle.textContent = title;
  el.resCode.textContent = code;
  el.resSummary.textContent = summary;

  // famous
  el.whoList.innerHTML = (info.famous||[]).map(n=>`<li>${n}</li>`).join('');

  // bars
  showBars();
}

// ===== Share =====
function shareWA(){
  const code = $('result-code').textContent || '';
  const title = $('result-title').textContent || '';
  const msg = encodeURIComponent(LANG==='ar'
    ? `نتيجتي في اختبار MBTI: ${title} (${code})`
    : `My MBTI result: ${title} (${code})`);
  window.open(`https://wa.me/?text=${msg}`,'_blank');
}
function shareX(){
  const code = $('result-code').textContent || '';
  const title = $('result-title').textContent || '';
  const msg = encodeURIComponent(LANG==='ar'
    ? `نتيجتي في اختبار MBTI: ${title} (${code})`
    : `My MBTI result: ${title} (${code})`);
  window.open(`https://twitter.com/intent/tweet?text=${msg}`,'_blank');
}

// ===== Theme & Lang =====
function toggleTheme(){
  DARK = !DARK;
  localStorage.setItem('mbti_theme', DARK?'dark':'light');
  document.body.classList.toggle('dark', DARK);
  el.theme.textContent = DARK ? '☀️' : '🌙';
}
function setLang(l){
  LANG = l;
  localStorage.setItem('mbti_lang', l);
  renderStatic();

  // إذا كنا في شاشة الأسئلة، حدّث السؤال الحالي
  if (!el.quizScreen.classList.contains('hidden')) renderQuestion();
}

// ===== Footer text changes with language on load too =====
document.addEventListener('DOMContentLoaded', ()=>renderStatic());
