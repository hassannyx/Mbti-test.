/*********** Translations ***********/
const TX = {
  en: {
    title: "MBTI Personality Test",
    subtitle: "Discover your MBTI type in minutes",
    startDesc: "35 concise questions • 4 choices • No right or wrong answers.",
    startBtn: "Start Test",
    next: "Next",
    back: "Back",
    getResult: "Get Result",
    retry: "Restart",
    share: "Share your result",
    famous: "Famous with this type",
    axes: "Your preferences",
    labels: { I:"Introversion", E:"Extraversion", N:"Intuition", S:"Sensing", T:"Thinking", F:"Feeling", J:"Judging", P:"Perceiving" }
  },
  ar: {
    title: "اختبار شخصيات MBTI",
    subtitle: "اكتشف نوع شخصيتك خلال دقائق",
    startDesc: "35 سؤالًا مختصرًا • 4 اختيارات • لا إجابة صحيحة أو خاطئة.",
    startBtn: "ابدأ الاختبار",
    next: "التالي",
    back: "رجوع",
    getResult: "أظهِر النتيجة",
    retry: "إعادة الاختبار",
    share: "شارك نتيجتك",
    famous: "شخصيات مع هذا النمط",
    axes: "ميولك في الأبعاد",
    labels: { I:"انطوائية", E:"انبساط", N:"حدس", S:"حسي", T:"تفكير", F:"مشاعر", J:"حُكم", P:"إدراك" }
  }
};

let LANG = (localStorage.getItem("mbti_lang") || "en");
let DARK = (localStorage.getItem("mbti_theme") === "dark");

const $ = id => document.getElementById(id);
const app = document.body;

/*********** Questions (35) ***********/
/* لكل سؤال: أي خيار يقوّي أي بُعد */
const Q = [
  // I vs E (1–9)
  { t_en:"I feel recharged after time alone.", t_ar:"أستعيد نشاطي بعد قضاء وقت بمفردي.", dim:"I" },
  { t_en:"I easily start conversations with strangers.", t_ar:"أبدأ الحوارات مع الغرباء بسهولة.", dim:"E" },
  { t_en:"Quiet environments help me think.", t_ar:"البيئات الهادئة تساعدني على التفكير.", dim:"I" },
  { t_en:"I get energy from social gatherings.", t_ar:"أستمد طاقتي من التجمعات الاجتماعية.", dim:"E" },
  { t_en:"I prefer deep 1-to-1 talks to big groups.", t_ar:"أفضل الحوارات العميقة الثنائية على المجموعات الكبيرة.", dim:"I" },
  { t_en:"I talk to clarify my thoughts.", t_ar:"أتكلم لأوضّح أفكاري.", dim:"E" },
  { t_en:"I need time before giving my opinion.", t_ar:"أحتاج وقتًا قبل إبداء رأيي.", dim:"I" },
  { t_en:"I feel bored without frequent interaction.", t_ar:"أشعر بالملل دون تفاعل متكرر.", dim:"E" },
  { t_en:"I enjoy solitary hobbies.", t_ar:"أستمتع بهوايات فردية.", dim:"I" },
  // N vs S (10–18)
  { t_en:"I focus on patterns more than details.", t_ar:"أركّز على الأنماط أكثر من التفاصيل.", dim:"N" },
  { t_en:"I trust experience over theories.", t_ar:"أثق بالتجربة أكثر من النظريات.", dim:"S" },
  { t_en:"I imagine future possibilities often.", t_ar:"أتصوّر الاحتمالات المستقبلية كثيرًا.", dim:"N" },
  { t_en:"Facts and specifics are my preference.", t_ar:"أفضل الحقائق والتفاصيل المحددة.", dim:"S" },
  { t_en:"Metaphors help me understand ideas.", t_ar:"تساعدني الاستعارات على فهم الأفكار.", dim:"N" },
  { t_en:"I like instructions step by step.", t_ar:"أحب التعليمات خطوة بخطوة.", dim:"S" },
  { t_en:"I enjoy brainstorming ‘what if’.", t_ar:"أستمتع بعصف ذهني من نوع ماذا لو.", dim:"N" },
  { t_en:"I notice concrete things around me first.", t_ar:"ألاحظ الأشياء الملموسة حولي أولًا.", dim:"S" },
  { t_en:"I see connections others might miss.", t_ar:"أرى روابط قد لا يلاحظها الآخرون.", dim:"N" },
  // T vs F (19–26)
  { t_en:"I decide by logic more than harmony.", t_ar:"أقرّر بالمنطق أكثر من الانسجام.", dim:"T" },
  { t_en:"People’s feelings weigh in my decisions.", t_ar:"مشاعر الآخرين تؤثر في قراراتي.", dim:"F" },
  { t_en:"I value fairness over compassion.", t_ar:"أقدّر العدالة أكثر من التعاطف.", dim:"T" },
  { t_en:"I avoid hurting feelings even if hard.", t_ar:"أتجنب جرح المشاعر حتى لو كان صعبًا.", dim:"F" },
  { t_en:"I enjoy honest debate.", t_ar:"أستمتع بالنقاش الصريح.", dim:"T" },
  { t_en:"I prioritize relationships over winning arguments.", t_ar:"أقدّم العلاقات على كسب الجدال.", dim:"F" },
  { t_en:"I separate people from problems.", t_ar:"أفصل بين الأشخاص والمشكلات.", dim:"T" },
  { t_en:"I make peace quickly.", t_ar:"أُصلح الخلاف سريعًا.", dim:"F" },
  // J vs P (27–35)
  { t_en:"I like plans and checklists.", t_ar:"أحب الخطط والقوائم.", dim:"J" },
  { t_en:"I keep options open until the last minute.", t_ar:"أبقي الخيارات مفتوحة حتى اللحظة الأخيرة.", dim:"P" },
  { t_en:"I feel comfortable with clear structure.", t_ar:"أرتاح للهيكل الواضح.", dim:"J" },
  { t_en:"I adapt spontaneously when plans change.", t_ar:"أتكيّف بعفوية عند تغيّر الخطط.", dim:"P" },
  { t_en:"I complete tasks before relaxing.", t_ar:"أنهي المهام قبل الاسترخاء.", dim:"J" },
  { t_en:"I work best close to deadlines.", t_ar:"أعمل بأفضل صورة قرب المواعيد النهائية.", dim:"P" },
  { t_en:"I prefer decisions early.", t_ar:"أفضل اتخاذ القرارات مبكرًا.", dim:"J" },
  { t_en:"I like exploring instead of deciding fast.", t_ar:"أفضل الاستكشاف بدل الحسم السريع.", dim:"P" },
  { t_en:"I categorize and organize naturally.", t_ar:"أصنّف وأنظّم بشكل طبيعي.", dim:"J" },
];

/*********** Type data (description + famous) ***********/
const TYPES = {
  INTJ:{ name:"Architect", ar:"العقل المدبّر",
    desc_en:"Strategic, independent, future-oriented problem solver.",
    desc_ar:"استراتيجي، مستقل، يحلّ المشكلات برؤية مستقبلية.",
    famous:["Light Yagami (Anime)","Lelouch vi Britannia (Anime)","Elon Musk","Marie Curie","Friedrich Nietzsche"] },
  INTP:{ name:"Logician", ar:"المنطقي",
    desc_en:"Analytical thinker who loves systems and ideas.",
    desc_ar:"مفكّر تحليلي يحب الأنظمة والأفكار.",
    famous:["L (Death Note)","Shikamaru Nara","Albert Einstein","Isaac Newton","Larry Page"] },
  ENTJ:{ name:"Commander", ar:"القائد",
    desc_en:"Bold, decisive leader who drives vision into reality.",
    desc_ar:"قائد جريء حاسم يحوّل الرؤية إلى واقع.",
    famous:["Erwin Smith","Levi Ackerman","Steve Jobs","Indra Nooyi","Margaret Thatcher"] },
  ENTP:{ name:"Debater", ar:"المجادل",
    desc_en:"Quick-witted, innovative, enjoys challenging ideas.",
    desc_ar:"سريع البديهة، مبتكر، يستمتع بتحدّي الأفكار.",
    famous:["Monkey D. Luffy","Hideo (Dr. Stone)","Mark Cuban","Sacha Baron Cohen","Tom Hanks"] },

  INFJ:{ name:"Advocate", ar:"المدافع",
    desc_en:"Insightful idealist with strong values and empathy.",
    desc_ar:"مثالي ثاقب البصيرة بقيم قوية وتعاطف.",
    famous:["Itachi Uchiha","Saber (Artoria)","Nelson Mandela","J. K. Rowling","Mother Teresa"] },
  INFP:{ name:"Mediator", ar:"الوسيط",
    desc_en:"Imaginative, value-driven, seeks meaning and harmony.",
    desc_ar:"خيالي تحكمه القيم، يبحث عن المعنى والانسجام.",
    famous:["Nagisa (Clannad)","Shinji Ikari","William Shakespeare","Alicia Keys","Johnny Depp"] },
  ENFJ:{ name:"Protagonist", ar:"البطل",
    desc_en:"Charismatic inspirer who unites and uplifts others.",
    desc_ar:"كاريزمي مُلهِم يوحّد ويُنهض الآخرين.",
    famous:["Tanjiro Kamado","All Might","Barack Obama","Oprah Winfrey","Malala Yousafzai"] },
  ENFP:{ name:"Campaigner", ar:"المناضل",
    desc_en:"Enthusiastic, creative free-spirit who sparks ideas.",
    desc_ar:"متحمس خلاق، روح حرة تشعل الأفكار.",
    famous:["Naruto Uzumaki","Aang","Robin Williams","Will Smith","Keanu Reeves"] },

  ISTJ:{ name:"Logistician", ar:"اللوجستي",
    desc_en:"Responsible, organized, values duty and reliability.",
    desc_ar:"مسؤول ومنظم، يقدّر الواجب والاعتمادية.",
    famous:["Mikasa Ackerman","Giyu Tomioka","Angela Merkel","Warren Buffett","Natalie Portman"] },
  ISFJ:{ name:"Defender", ar:"المدافع",
    desc_en:"Warm protector who is dedicated and loyal.",
    desc_ar:"حامٍ دافئ مخلص ومتفانٍ.",
    famous:["Hinata Hyuga","Nezuko Kamado","Beyoncé","Kate Middleton","Anne Hathaway"] },
  ESTJ:{ name:"Executive", ar:"المدير",
    desc_en:"Efficient organizer who loves order and results.",
    desc_ar:"منظم فعّال يحب النظام والنتائج.",
    famous:["Roy Mustang","Asuna Yuuki","Sundar Pichai","Sheryl Sandberg","Gordon Ramsay"] },
  ESFJ:{ name:"Consul", ar:"الاستشاري",
    desc_en:"Social caregiver who builds harmony and support.",
    desc_ar:"اجتماعي داعم يبني الانسجام والمساندة.",
    famous:["Sakura Haruno","Orihime Inoue","Taylor Swift","Jennifer Lopez","Ed Sheeran"] },

  ISTP:{ name:"Virtuoso", ar:"البارع",
    desc_en:"Practical experimenter; calm in crises; loves tools.",
    desc_ar:"عملي مجرّب؛ هادئ وقت الأزمات؛ يحب الأدوات.",
    famous:["Levi (AoT)","Spike Spiegel","Bruce Lee","Michael Jordan","Scarlett Johansson"] },
  ISFP:{ name:"Adventurer", ar:"المغامر",
    desc_en:"Sensitive artist who explores personal expression.",
    desc_ar:"فنان حسّاس يستكشف التعبير الشخصي.",
    famous:["Zoro (One Piece)","Thorfinn","Billie Eilish","Michael Jackson","Zendaya"] },
  ESTP:{ name:"Entrepreneur", ar:"رائد الأعمال",
    desc_en:"Energetic doer who loves action and challenge.",
    desc_ar:"عملي نشيط يحب الحركة والتحدي.",
    famous:["Bakugo Katsuki","Joseph Joestar","Dwayne Johnson","Floyd Mayweather","Madonna"] },
  ESFP:{ name:"Entertainer", ar:"المؤدّي",
    desc_en:"Spontaneous performer; brings fun and excitement.",
    desc_ar:"مؤدٍ عفوي يجلب المتعة والحماس.",
    famous:["Usopp","Yoruichi","Rihanna","Bruno Mars","Miley Cyrus"] },
};

/*********** UI Elements & State ***********/
const el = {
  title: $("title"), subtitle: $("subtitle"),
  startScreen: $("start-screen"), startDesc: $("start-desc"), startBtn: $("start-btn"),
  quizScreen: $("quiz-screen"), qText: $("question-text"), opts: $("options"),
  counter: $("counter"), nextBtn: $("next-btn"), prevBtn: $("prev-btn"),
  resultScreen: $("result-screen"), resTitle: $("result-title"), resCode: $("result-code"),
  resSummary: $("result-summary"), bars: $("bars"),
  whoTitle: $("who-title"), whoList: $("who-list"),
  shareTitle: $("share-title"), shareWA: $("share-wa"), shareX: $("share-x"),
  retry: $("retry-btn"), nextLabel:$("nextLabel"), prevLabel:$("prevLabel"),
  theme: $("theme-toggle"), langAr:$("lang-ar"), langEn:$("lang-en"),
  brand:$("brand"), made:$("made")
};

let idx = 0;                         // question index
const answers = [];                  // stores +2, +1, -1, -2
const score = { I:0,E:0,N:0,S:0,T:0,F:0,J:0,P:0 };

/*********** Helpers ***********/
function t(k){ return TX[LANG][k]; }
function setLang(l){ LANG=l; localStorage.setItem("mbti_lang",l); renderStatic(); if(!el.quizScreen.classList.contains("hidden")) renderQuestion(); }
function toggleTheme(){ DARK=!DARK; localStorage.setItem("mbti_theme", DARK?"dark":"light"); document.body.classList.toggle("dark",DARK); el.theme.textContent = DARK ? "☀️" : "🌙"; }
function optHTML(txt,val){ return `<div class="opt" data-v="${val}">${txt}</div>`; }
function bar(label, pct){ return `<div class="muted" style="display:flex;justify-content:space-between"><span>${label}</span><span>${pct}%</span></div><div class="bar"><div class="barin" style="width:${pct}%"></div></div>`; }

/*********** Render Static Texts ***********/
function renderStatic(){
  $("title").innerText = TX[LANG].title;
  el.title.textContent = TX[LANG].title;
  el.subtitle.textContent = TX[LANG].subtitle;
  el.startDesc.textContent = TX[LANG].startDesc;
  el.startBtn.textContent = TX[LANG].startBtn;
  el.nextLabel.textContent = TX[LANG].next;
  el.prevLabel.textContent = TX[LANG].back;
  el.retry.textContent = TX[LANG].retry;
  el.whoTitle.textContent = TX[LANG].famous;
  el.shareTitle.textContent = TX[LANG].share;
  el.brand.textContent = TX[LANG].title;
  // تمييز زر اللغة
  el.langAr.style.opacity = LANG==='ar'?1:.6;
  el.langEn.style.opacity = LANG==='en'?1:.6;
  document.dir = LANG==='ar' ? 'rtl' : 'ltr';
}

/*********** Start / Navigation ***********/
function startTest(){
  idx = 0; answers.length = 0;
  Object.keys(score).forEach(k=>score[k]=0);
  el.startScreen.classList.add("hidden");
  el.resultScreen.classList.add("hidden");
  el.quizScreen.classList.remove("hidden");
  renderQuestion();
}
function selectOpt(e){
  const card = e.currentTarget;
  [...el.opts.children].forEach(x=>x.classList.remove("sel"));
  card.classList.add("sel");
}
function next(){
  const sel = el.opts.querySelector(".sel");
  if(!sel) return alert(LANG==='ar'?'اختر إجابة':'Pick an answer');
  const v = +sel.dataset.v; answers[idx] = v;

  // Apply to dimension
  const d = Q[idx].dim;
  if(d==='I'||d==='E'||d==='N'||d==='S'||d==='T'||d==='F'||d==='J'||d==='P'){
    // v = +2, +1, -1, -2. Positive increases the mentioned dim; negative increases the opposite.
    const opp = {I:'E',E:'I',N:'S',S:'N',T:'F',F:'T',J:'P',P:'J'}[d];
    if(v>0) score[d]+=v; else score[opp]+=(-v);
  }

  idx++;
  if(idx < Q.length) renderQuestion();
  else showResult();
}
function prev(){
  if(idx===0) return;
  idx--;
  renderQuestion(true);
}

/*********** Render Question ***********/
function renderQuestion(fromPrev=false){
  const q = Q[idx];
  el.counter.textContent = `${idx+1} / ${Q.length}`;
  el.qText.textContent = LANG==='ar' ? q.t_ar : q.t_en;
  el.opts.innerHTML = [
    optHTML(LANG==='ar'?'أوافق بشدة':'Strongly Agree',  2),
    optHTML(LANG==='ar'?'أوافق':'Agree',                1),
    optHTML(LANG==='ar'?'لا أوافق':'Disagree',         -1),
    optHTML(LANG==='ar'?'لا أوافق بشدة':'Strongly Disagree', -2),
  ].join('');

  // استعادة الاختيار إن وُجد
  const saved = answers[idx];
  if(saved!=null){
    [...el.opts.children].forEach(div => {
      if(+div.dataset.v===saved) div.classList.add('sel');
    });
  }

  // أحداث الاختيار
  [...el.opts.children].forEach(div => div.addEventListener("click", selectOpt));

  // تقدّم
  const p = Math.round((idx)/Q.length*100);
  $("progress-fill").style.width = p+"%";

  // أزرار
  el.prevBtn.disabled = idx===0;
  el.nextBtn.textContent = (idx===Q.length-1) ? (LANG==='ar'?TX[LANG].getResult:TX[LANG].getResult) : (LANG==='ar'?TX[LANG].next:TX[LANG].next);
}

/*********** Compute Result ***********/
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
function showResult(){
  el.quizScreen.classList.add("hidden");
  el.resultScreen.classList.remove("hidden");

  const code = codeFromScores();
  const info = TYPES[code];
  const title = `${code} — ${LANG==='ar'?info.ar:info.name}`;
  const summary = LANG==='ar' ? info.desc_ar : info.desc_en;

  el.resTitle.textContent = title;
  el.resCode.textContent = code;
  el.resSummary.textContent = summary;

  // famous
  el.whoList.innerHTML = info.famous.map(n=>`<li>${n}</li>`).join('');

  // bars
  showBars();

  // share
  const shareMsg = encodeURIComponent(`${LANG==='ar'?'نتيجتي في اختبار MBTI:':'My MBTI result:'} ${code} — ${LANG==='ar'?info.ar:info.name}`);
  el.shareWA.onclick = ()=>window.open(`https://wa.me/?text=${shareMsg}`, '_blank');
  el.shareX.onclick  = ()=>window.open(`https://twitter.com/intent/tweet?text=${shareMsg}`, '_blank');
}

/*********** Wiring ***********/
function init(){
  // theme
  document.body.classList.toggle("dark", DARK);
  el.theme.textContent = DARK ? "☀️" : "🌙";
  el.theme.addEventListener("click", toggleTheme);

  // lang
  el.langAr.addEventListener("click", ()=>setLang('ar'));
  el.langEn.addEventListener("click", ()=>setLang('en'));

  // start
  el.startBtn.addEventListener("click", startTest);
  el.nextBtn.addEventListener("click", next);
  el.prevBtn.addEventListener("click", prev);
  el.retry.addEventListener("click", ()=>{ el.resultScreen.classList.add("hidden"); el.startScreen.classList.remove("hidden"); });

  renderStatic();
}
init();
