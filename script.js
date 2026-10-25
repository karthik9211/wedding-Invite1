if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function resetToHome() {
  if (window.location.hash) {
    const homeUrl = new URL(window.location.href);
    homeUrl.hash = '';
    history.replaceState(null, '', homeUrl);
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}
resetToHome();
window.addEventListener('pageshow', resetToHome);

const music=document.getElementById('wedding-audio');
const musicToggle=document.querySelector('.music-toggle');
let musicMuted=false;
function syncMusicToggle(){
  musicToggle.classList.toggle('is-muted',musicMuted);
  musicToggle.setAttribute('aria-pressed',String(!musicMuted));
  musicToggle.setAttribute('aria-label',musicMuted?'Unmute music':'Mute music');
}
const musicGestures=['pointerdown','touchend','click','keydown'];
function onFirstGesture(event){
  if(musicToggle.contains(event.target)||!landingScreen.classList.contains('is-opening'))return;
  startMusic();
}
function startMusic(){
  musicToggle.hidden=false;
  if(!musicMuted)music.play().catch(()=>musicToggle.classList.add('needs-tap'));
}
music.addEventListener('play',()=>musicToggle.classList.remove('needs-tap'));
function stopWaitingForGesture(){
  musicGestures.forEach(type=>document.removeEventListener(type,onFirstGesture,true));
}
musicGestures.forEach(type=>document.addEventListener(type,onFirstGesture,true));
music.addEventListener('play',stopWaitingForGesture,{once:true});
musicToggle.addEventListener('click',()=>{
  if(!musicMuted&&music.paused){music.play().catch(()=>{});return}
  musicMuted=!musicMuted;
  if(musicMuted)music.pause();else music.play().catch(()=>{});
  syncMusicToggle();
});
syncMusicToggle();
const landingScreen=document.querySelector('.landing-screen');
const landingOpenButton=landingScreen.querySelector('.landing-open');
function openLanding(){
  if(landingScreen.classList.contains('is-opening'))return;
  landingScreen.classList.add('is-opening');
  startMusic();
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(()=>{
    document.querySelector('.hero').classList.add('is-revealing');
  },reducedMotion?0:2800);
  window.setTimeout(()=>{
    landingScreen.hidden=true;
    document.body.classList.remove('landing-active');
  },reducedMotion?0:3900);
}
landingOpenButton.addEventListener('click',openLanding);

const nav=document.querySelector('.nav');window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>60),{passive:true});const menu=document.querySelector('.menu');menu.addEventListener('click',()=>{const links=document.querySelector('.links');const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});document.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.links').classList.remove('open');menu.setAttribute('aria-expanded','false')}));const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));function tick(){const delta=Math.max(0,new Date('2026-12-19T08:30:00-05:00')-new Date());const values=[Math.floor(delta/86400000),Math.floor(delta/3600000)%24,Math.floor(delta/60000)%60,Math.floor(delta/1000)%60];['days','hours','minutes','seconds'].forEach((id,i)=>document.getElementById(id).textContent=String(values[i]).padStart(2,'0'))}tick();setInterval(tick,1000);
const hero=document.querySelector('.hero');
const heroStage=document.querySelector('.hero-stage');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let heroFrame=0;
let heroProgress=0;
let targetHeroProgress=0;
let lastHeroFrameTime=0;

function updateHero(timestamp){
  heroFrame=0;
  if(reduceMotion)return;
  const elapsed=lastHeroFrameTime?timestamp-lastHeroFrameTime:16.7;
  lastHeroFrameTime=timestamp;
  heroProgress+=(targetHeroProgress-heroProgress)*(1-Math.exp(-elapsed/150));
  if(Math.abs(targetHeroProgress-heroProgress)<.001)heroProgress=targetHeroProgress;
  heroStage.style.setProperty('--hero-progress',heroProgress.toFixed(3));
  heroStage.style.setProperty('--art-y',`${-heroProgress*64}px`);
  heroStage.style.setProperty('--art-scale',String(1+heroProgress*.045));
  heroStage.style.setProperty('--title-opacity',String(Math.max(0,1-heroProgress*1.7)));
  heroStage.style.setProperty('--title-y',`${-heroProgress*24}px`);
  if(heroProgress!==targetHeroProgress)heroFrame=requestAnimationFrame(updateHero);
}

function requestHeroUpdate(){
  if(reduceMotion)return;
  const range=hero.offsetHeight-heroStage.offsetHeight;
  targetHeroProgress=range>0?Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/range)):0;
  if(!heroFrame)heroFrame=requestAnimationFrame(updateHero);
}

window.addEventListener('scroll',requestHeroUpdate,{passive:true});
window.addEventListener('resize',requestHeroUpdate);
updateHero();

const parallaxElements=[...document.querySelectorAll('.event, .venue-card, .hotel, .rsvp-form')];
const parallaxItems=parallaxElements.map(element=>({element,current:0,target:0}));
let parallaxFrame=0;
let lastParallaxFrameTime=0;

function updateScrollParallax(timestamp){
  parallaxFrame=0;
  if(reduceMotion)return;
  const elapsed=lastParallaxFrameTime?timestamp-lastParallaxFrameTime:16.7;
  lastParallaxFrameTime=timestamp;
  const easing=1-Math.exp(-elapsed/180);
  let needsFrame=false;

  parallaxItems.forEach(item=>{
    item.current+=(item.target-item.current)*easing;
    if(Math.abs(item.target-item.current)<.05)item.current=item.target;
    item.element.style.setProperty('--scroll-parallax-y',`${item.current.toFixed(2)}px`);
    if(item.current!==item.target)needsFrame=true;
  });

  if(needsFrame)parallaxFrame=requestAnimationFrame(updateScrollParallax);
}

function requestScrollParallax(){
  if(reduceMotion)return;
  const viewportCenter=window.innerHeight/2;
  parallaxItems.forEach(item=>{
    const rect=item.element.getBoundingClientRect();
    const offset=viewportCenter-(rect.top+rect.height/2);
    item.target=Math.max(-16,Math.min(16,offset*.025));
  });
  if(!parallaxFrame)parallaxFrame=requestAnimationFrame(updateScrollParallax);
}

window.addEventListener('scroll',requestScrollParallax,{passive:true});
window.addEventListener('resize',requestScrollParallax);
requestScrollParallax();

const rsvpForm=document.querySelector('.rsvp-form');
const rsvpPhoneInput=document.querySelector('#rsvp-phone');
const rsvpResponseFrame=document.querySelector('.rsvp-response-frame');
const rsvpStatus=document.querySelector('.rsvp-status');
const rsvpPopup=document.querySelector('.rsvp-popup');
const rsvpSubmitButton=rsvpForm.querySelector('button[type="submit"]');
let rsvpSubmissionPending=false;
let rsvpSubmissionTimeout;
let rsvpStatusTimeout;

rsvpPhoneInput.addEventListener('input',()=>rsvpPhoneInput.setCustomValidity(''));
rsvpPhoneInput.addEventListener('invalid',()=>{
  rsvpPhoneInput.setCustomValidity(rsvpPhoneInput.validity.valueMissing
    ?'Please enter your 10-digit phone number.'
    :'Please enter a valid phone number using exactly 10 digits.');
});

function showRsvpPopup(message){
  window.clearTimeout(rsvpStatusTimeout);
  rsvpPopup.textContent=message;
  rsvpPopup.classList.add('is-visible');
  rsvpStatusTimeout=window.setTimeout(()=>{
    rsvpPopup.classList.remove('is-visible');
  },4000);
}

rsvpForm.addEventListener('submit',()=>{
  rsvpSubmissionPending=true;
  rsvpSubmitButton.disabled=true;
  rsvpStatus.textContent='Submitting your RSVP...';
  window.clearTimeout(rsvpSubmissionTimeout);
  rsvpSubmissionTimeout=window.setTimeout(()=>{
    rsvpSubmissionPending=false;
    rsvpSubmitButton.disabled=false;
    rsvpStatus.textContent='We could not confirm your RSVP. Please check your connection and try again.';
  },15000);
});

rsvpResponseFrame.addEventListener('load',()=>{
  if(!rsvpSubmissionPending)return;
  rsvpSubmissionPending=false;
  window.clearTimeout(rsvpSubmissionTimeout);
  rsvpSubmitButton.disabled=false;
  rsvpForm.reset();
  rsvpStatus.textContent='Thank you! Your RSVP has been submitted.';
  showRsvpPopup('RSVP submitted successfully!');
});
