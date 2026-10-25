
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, sendEmailVerification, signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

/* The public Firebase web configuration is shared with Nao. API keys are not private credentials.
   All permissions and private data must remain protected by server-side Firebase rules. */
const config = {
  apiKey: "AIzaSyAhwuVKlw3pXitIPNXnGtclwZJSHj-9-fg",
  authDomain: "lmk-nao.firebaseapp.com",
  projectId: "lmk-nao",
  storageBucket: "lmk-nao.firebasestorage.app",
  messagingSenderId: "506801975831",
  appId: "1:506801975831:web:881375c4a03d6d0e206252"
};
const es = document.documentElement.lang.toLowerCase().startsWith("es");
const t = es ? {
  login:"Iniciar sesión", account:"Mi cuenta", heading:"Bienvenido a Lumekori",
  intro:"Accede con una cuenta de Nao o crea una cuenta de Lumekori. La navegación siempre es pública.",
  google:"Continuar con Google", email:"Continuar con correo", loginEmail:"Entrar con correo",
  register:"Crear una cuenta", signIn:"Iniciar sesión", reset:"Recuperar contraseña",
  emailLabel:"Correo electrónico", passwordLabel:"Contraseña", back:"Volver",
  createPrompt:"¿Todavía no tienes cuenta?", createLink:"Regístrate",
  signInPrompt:"¿Ya tienes una cuenta?", signInLink:"Inicia sesión",
  forgot:"¿Olvidaste tu contraseña?", sendReset:"Enviar enlace de recuperación",
  resetInfo:"Enviaremos instrucciones si existe una cuenta asociada a ese correo.",
  emailVerification:"Te enviamos un mensaje para verificar tu correo. Comprueba también la carpeta de spam.",
  resetSent:"Si el correo corresponde a una cuenta, recibirás un enlace para restablecer la contraseña.",
  logged:"Has iniciado sesión con la cuenta compartida de Lumekori y Nao.",
  verify:"Correo pendiente de verificar", resend:"Reenviar verificación",
  verified:"Correo verificado", signOut:"Cerrar sesión", privacy:"Privacidad",
  close:"Cerrar", loading:"Conectando con Firebase…", processing:"Procesando…",
  error:"No se pudo completar la operación. Inténtalo nuevamente.",
  invalid:"Comprueba tu correo y contraseña.", weak:"Utiliza una contraseña de al menos 15 caracteres.",
  used:"Este correo ya tiene una cuenta. Prueba a iniciar sesión o recuperar tu contraseña.",
  provider:"Esta cuenta utiliza otro método de acceso. Entra con ese método.",
  blocked:"Habilita las ventanas emergentes para iniciar sesión con Google.",
  domain:"Es necesario autorizar lumekori.dev en Firebase Authentication.",
  unavailable:"El acceso no está disponible por ahora. Revisa la conexión o comunícate con soporte.",
  restricted:"Demasiados intentos. Vuelve a intentarlo más tarde.",
  accountInfo:"Puedes utilizar esta misma identidad para los productos compatibles, incluido Nao.",
  deleteInfo:"Para consultar sobre la eliminación de una cuenta compartida, escribe a support-nao@lumekori.dev.",
  note:"No es obligatorio iniciar sesión para utilizar el sitio.", googleCanceled:"Inicio de sesión cancelado.",
  verifyAgain:"Se envió otro mensaje de verificación."
} : {
  login:"Sign in", account:"My account", heading:"Welcome to Lumekori",
  intro:"Use your Nao account or create a Lumekori account. Browsing remains open to everyone.",
  google:"Continue with Google", email:"Continue with email", loginEmail:"Sign in with email",
  register:"Create an account", signIn:"Sign in", reset:"Reset password",
  emailLabel:"Email address", passwordLabel:"Password", back:"Back",
  createPrompt:"Don't have an account?", createLink:"Sign up",
  signInPrompt:"Already have an account?", signInLink:"Sign in",
  forgot:"Forgot your password?", sendReset:"Send password reset link",
  resetInfo:"We'll send instructions if an account with that email exists.",
  emailVerification:"We sent you an email verification link. Check your spam folder, too.",
  resetSent:"If there is an account for that email, you will receive a password reset link.",
  logged:"You're signed in with your Lumekori and Nao account.",
  verify:"Email not verified", resend:"Resend verification",
  verified:"Email verified", signOut:"Sign out", privacy:"Privacy",
  close:"Close", loading:"Connecting to Firebase…", processing:"Working…",
  error:"This action could not be completed. Please try again.",
  invalid:"Check your email and password.", weak:"Use a password with at least 15 characters.",
  used:"That email already has an account. Try signing in or resetting your password.",
  provider:"This account uses another sign-in method. Please use that method.",
  blocked:"Allow pop-ups to sign in with Google.",
  domain:"lumekori.dev needs to be added to Firebase Authentication authorized domains.",
  unavailable:"Sign-in is currently unavailable. Check your connection or contact support.",
  restricted:"Too many attempts. Please try again later.",
  accountInfo:"You can use this identity across compatible products, including Nao.",
  deleteInfo:"For help deleting a shared account, contact support-nao@lumekori.dev.",
  note:"Signing in is optional; the website is open to everyone.", googleCanceled:"Sign-in canceled.",
  verifyAgain:"Another verification email was sent."
};
// Keep social footer links consistent on pages with older static markup.
const lumekoriSocialProfiles = {
  instagram: "https://www.instagram.com/lumekori.dev/",
  tiktok: "https://www.tiktok.com/@lumekori",
  discord: "https://discord.gg/BcYATsz8xk"
};
function connectLumekoriSocials() {
  document.querySelectorAll(".preview-social-row .preview-social-unlinked[data-network]").forEach(placeholder => {
    const href = lumekoriSocialProfiles[placeholder.dataset.network];
    if (!href) return;
    const link = document.createElement("a");
    link.className = "preview-social-icon";
    link.dataset.network = placeholder.dataset.network;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", placeholder.getAttribute("aria-label") || placeholder.dataset.network);
    link.title = link.getAttribute("aria-label");
    while (placeholder.firstChild) link.appendChild(placeholder.firstChild);
    placeholder.replaceWith(link);
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", connectLumekoriSocials, { once: true });
} else {
  connectLumekoriSocials();
}



/* Turn the call to action in each hover preview into a real, keyboard-accessible link.
   Reuse its own navigation item's href, so Spanish and English links stay in sync. */
function enableLumekoriNavPreviewLinks() {
  document.querySelectorAll(".nav-preview-page .nav-wrap .nav-preview-item").forEach(item => {
    const destination = item.querySelector(":scope > a[href]");
    const popover = item.querySelector(":scope > .nav-popover");
    const hint = popover?.querySelector(".nav-popover-hint");
    if (!destination || !hint || hint.querySelector("a")) return;

    // Keep the full-width divider on the wrapper, but make only the text a link.
    const link = document.createElement("a");
    link.href = destination.getAttribute("href");
    link.textContent = hint.textContent;
    hint.replaceChildren(link);

    popover.setAttribute("role", "group");
    popover.setAttribute("aria-label", destination.textContent.trim());
    destination.removeAttribute("aria-describedby");
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enableLumekoriNavPreviewLinks, { once: true });
} else {
  enableLumekoriNavPreviewLinks();
}


/* Mobile navigation stays consistent on every Lumekori page:
   dismiss the blurred backdrop by tapping outside the menu or pressing Escape. */
function initLumekoriMobileNavDismiss() {
  const menu = document.querySelector("body.nav-preview-page > .mobilemenu");
  const toggle = document.querySelector(".nav-preview-page .nav-wrap [data-menu]");
  if (!menu || !toggle) return;

  if (!menu.id) menu.id = "lmk-mobile-site-menu";
  toggle.setAttribute("aria-controls", menu.id);

  const isOpen = () => menu.classList.contains("open");
  const close = () => menu.classList.remove("open");
  const sync = () => toggle.setAttribute("aria-expanded", String(isOpen()));
  sync();
  new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ["class"] });

  document.addEventListener("click", event => {
    if (isOpen() && !menu.contains(event.target) && !toggle.contains(event.target)) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && isOpen()) {
      close();
      toggle.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 950 && isOpen()) close();
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLumekoriMobileNavDismiss, { once: true });
} else {
  initLumekoriMobileNavDismiss();
}

/* Lumekori / Lumekori Games: show only the alternate site in the logo menu. */
function initLumekoriSiteSwitcher() {
  const brandLink = document.querySelector(".nav-preview-page .nav-wrap .nav > a.brand");
  if (!brandLink || document.querySelector(".lmk-brand-switcher")) return;

  // On inner pages the logo must remain its original link to the homepage.
  const spanish = document.documentElement.lang.toLowerCase().startsWith("es");
  const path = window.location.pathname;
  const homePaths = spanish
    ? ["/es", "/es/", "/es/index.html"]
    : ["/", "/index.html"];
  if (!homePaths.includes(path)) return;

  const destination = spanish ? "/es/games/" : "/games/";
  const optionLabel = "Lumekori Games";

  const wrapper = document.createElement("div");
  wrapper.className = "lmk-brand-switcher";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "brand lmk-brand-trigger";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "lmk-brand-site-menu");
  trigger.setAttribute("aria-label", spanish ? "Cambiar sitio de Lumekori" : "Switch Lumekori site");
  trigger.title = spanish ? "Cambiar sitio" : "Switch site";
  while (brandLink.firstChild) trigger.appendChild(brandLink.firstChild);

  const menu = document.createElement("div");
  menu.id = "lmk-brand-site-menu";
  menu.className = "lmk-brand-menu";
  menu.hidden = true;

  const link = document.createElement("a");
  link.className = "lmk-brand-option";
  link.href = destination;
  link.textContent = optionLabel;
  menu.appendChild(link);

  wrapper.append(trigger, menu);
  brandLink.replaceWith(wrapper);

  const close = () => {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  };
  trigger.addEventListener("click", () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    trigger.setAttribute("aria-expanded", String(opening));
  });
  wrapper.addEventListener("focusout", (event) => {
    if (!wrapper.contains(event.relatedTarget)) close();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!wrapper.contains(event.target)) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      close();
      trigger.focus();
    }
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLumekoriSiteSwitcher, { once: true });
} else {
  initLumekoriSiteSwitcher();
}

const app = getApps().length ? getApp() : initializeApp(config);
const auth = getAuth(app);
auth.languageCode = es ? "es" : "en";
const privacyPath = es ? "/es/privacy/" : "/privacy/";
const controls = document.querySelector(".controls, .nav-actions, .tester-controls, .navend");
let holder=controls;
if (!holder) {
  const gamesHeader = document.querySelector("header.nav");
  if (gamesHeader) {
    holder=document.createElement("div");
    holder.className="lmk-account-nav";
    gamesHeader.appendChild(holder);
  }
}
if (holder) {
  const opener = document.createElement("button");
  opener.type="button";
  opener.className="lmk-auth-trigger";
  opener.setAttribute("aria-haspopup","dialog");
  opener.setAttribute("aria-label",t.login);
  opener.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.3"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg><span class="lmk-auth-label"></span>';
  const buttonText=opener.querySelector(".lmk-auth-label");
  buttonText.textContent=t.login;
  holder.insertBefore(opener,holder.firstChild);

  const dialog=document.createElement("dialog");
  dialog.className="lmk-auth-dialog";
  dialog.setAttribute("aria-label",t.heading);
  dialog.innerHTML=
    '<div class="lmk-auth-window">'+
      '<button type="button" class="lmk-auth-close" aria-label="'+t.close+'">×</button>'+
      '<div class="lmk-auth-mark"><img alt="" src="/assets/lumekori-icon.png"><span>Lumekori</span></div>'+
      '<h2 class="lmk-auth-title"></h2><p class="lmk-auth-description"></p>'+
      '<div class="lmk-auth-choice">'+
        '<button class="lmk-auth-google" type="button"><span class="lmk-google-g" aria-hidden="true">G</span><span></span></button>'+
        '<button class="lmk-auth-email-action" type="button"><span aria-hidden="true">✉</span><span></span></button>'+
      '</div>'+
      '<form class="lmk-auth-form" hidden>'+
        '<label>'+t.emailLabel+'<input name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required></label>'+
        '<label class="lmk-password-field">'+t.passwordLabel+'<input name="password" type="password" autocomplete="current-password" minlength="1" maxlength="4096" required></label>'+
        '<button type="submit" class="lmk-auth-submit"></button>'+
      '</form>'+
      '<div class="lmk-auth-email-links" hidden>'+
        '<button class="lmk-auth-switch" type="button"></button>'+
        '<button class="lmk-auth-forgot" type="button"></button>'+
        '<button class="lmk-auth-back" type="button">'+t.back+'</button>'+
      '</div>'+
      '<div class="lmk-auth-profile" hidden>'+
        '<div class="lmk-auth-profile-name"></div><div class="lmk-auth-profile-email"></div>'+
        '<p class="lmk-auth-profile-state"></p>'+
        '<p class="lmk-auth-account-info"></p>'+
        '<button class="lmk-auth-verify" type="button" hidden></button>'+
        '<button class="lmk-auth-signout" type="button"></button>'+
        '<p class="lmk-auth-account-delete"></p>'+
      '</div>'+
      '<div class="lmk-auth-appearance" hidden><span class="lmk-auth-appearance-title"></span><button type="button" class="lmk-auth-theme-switch"><span aria-hidden="true">◐</span><span class="lmk-auth-theme-label"></span></button></div>'+
      '<p class="lmk-auth-message" role="status" aria-live="polite"></p>'+
      '<p class="lmk-auth-legal">'+t.note+' <a href="'+privacyPath+'">'+t.privacy+'</a></p>'+
    '</div>';
  document.body.appendChild(dialog);
  const $=sel=>dialog.querySelector(sel);
  const title=$(".lmk-auth-title"), description=$(".lmk-auth-description");
  const message=$(".lmk-auth-message"), form=$(".lmk-auth-form");
  const choice=$(".lmk-auth-choice"), links=$(".lmk-auth-email-links");
  const profile=$(".lmk-auth-profile"), passWrap=$(".lmk-password-field");
  const googleBtn=$(".lmk-auth-google"), emailBtn=$(".lmk-auth-email-action");
  const submit=$(".lmk-auth-submit"), switchBtn=$(".lmk-auth-switch");
  const forgotBtn=$(".lmk-auth-forgot"), backBtn=$(".lmk-auth-back");
  const verifyBtn=$(".lmk-auth-verify"), signoutBtn=$(".lmk-auth-signout");
  googleBtn.lastElementChild.textContent=t.google;
  emailBtn.lastElementChild.textContent=t.email;
  signoutBtn.textContent=t.signOut;
  verifyBtn.textContent=t.resend;
  $(".lmk-auth-account-info").textContent=t.accountInfo;
  $(".lmk-auth-account-delete").textContent=t.deleteInfo;
  // Make appearance available through the account dialog on phones; preserve desktop layout.
  const pageThemeToggle=document.querySelector('[data-theme-toggle]')||document.getElementById("theme");
  const appearance=$(".lmk-auth-appearance");
  const appearanceButton=$(".lmk-auth-theme-switch");
  if(pageThemeToggle){
    appearance.hidden=false;
    $(".lmk-auth-appearance-title").textContent=es?"Apariencia":"Appearance";
    const updateAppearance=()=>{
      const dark=document.documentElement.dataset.theme==="dark";
      $(".lmk-auth-theme-label").textContent=es?(dark?"Tema claro":"Tema oscuro"):(dark?"Light theme":"Dark theme");
      appearanceButton.setAttribute("aria-label",es?(dark?"Activar tema claro":"Activar tema oscuro"):(dark?"Switch to light theme":"Switch to dark theme"));
      appearanceButton.setAttribute("aria-pressed",String(dark));
    };
    appearanceButton.addEventListener("click",()=>{pageThemeToggle.click();updateAppearance();});
    opener.addEventListener("click",updateAppearance);
    updateAppearance();
  }
  let current=null, mode="choice", busy=false;
  const setMessage=(msg="",error=false)=>{
    message.textContent=msg;
    message.classList.toggle("lmk-auth-error",error);
  };
  const firebaseError=e=>{
    const code=String(e?.code||"");
    if(code==="auth/popup-closed-by-user"||code==="auth/cancelled-popup-request")return t.googleCanceled;
    if(code==="auth/popup-blocked"||code==="auth/operation-not-supported-in-this-environment")return t.blocked;
    if(code==="auth/unauthorized-domain")return t.domain;
    if(code==="auth/wrong-password"||code==="auth/user-not-found"||code==="auth/invalid-credential"||code==="auth/invalid-email")return t.invalid;
    if(code==="auth/email-already-in-use")return t.used;
    if(code==="auth/weak-password")return t.weak;
    if(code==="auth/account-exists-with-different-credential"||code==="auth/provider-already-linked")return t.provider;
    if(code==="auth/too-many-requests")return t.restricted;
    if(code==="auth/network-request-failed"||code==="auth/operation-not-allowed")return t.unavailable;
    console.warn("Lumekori authentication error:",code||"unknown");
    return t.error;
  };
  function setBusy(value){
    busy=value;
    [googleBtn,emailBtn,submit,switchBtn,forgotBtn,backBtn,verifyBtn,signoutBtn].forEach(b=>b.disabled=value);
  }
  function showMode(next){
    mode=next;
    setMessage("");
    choice.hidden=next!=="choice";
    form.hidden=!["login","register","reset"].includes(next);
    links.hidden=form.hidden;
    profile.hidden=next!=="profile";
    title.textContent=next==="profile"?t.account:next==="register"?t.register:next==="reset"?t.reset:t.heading;
    description.textContent=next==="profile"?t.logged:next==="reset"?t.resetInfo:t.intro;
    passWrap.hidden=next==="reset";
    passWrap.querySelector("input").required=next!=="reset";
    passWrap.querySelector("input").autocomplete=next==="register"?"new-password":"current-password";
    passWrap.querySelector("input").minLength=next==="register"?15:1;
    submit.textContent=next==="register"?t.register:next==="reset"?t.sendReset:t.loginEmail;
    switchBtn.textContent=next==="register"?(t.signInPrompt+" "+t.signInLink):(t.createPrompt+" "+t.createLink);
    forgotBtn.hidden=next==="register"||next==="reset";
    forgotBtn.textContent=t.forgot;
    backBtn.hidden=false;
    if(next==="profile")renderProfile();
  }
  function renderProfile(){
    if(!current)return;
    $(".lmk-auth-profile-name").textContent=current.displayName||t.account;
    $(".lmk-auth-profile-email").textContent=current.email||"";
    $(".lmk-auth-profile-state").textContent=current.emailVerified?t.verified:t.verify;
    verifyBtn.hidden=current.emailVerified||!current.email||current.providerData.every(p=>p.providerId!=="password");
  }
  function renderUser(user){
    current=user;
    buttonText.textContent=user?(user.displayName||user.email?.split("@")[0]||t.account).slice(0,22):t.login;
    opener.setAttribute("aria-label",user?t.account:t.login);
    opener.title=user?t.account:t.login;
    if(dialog.open)showMode(user?"profile":"choice");
  }
  opener.addEventListener("click",()=>{
    showMode(current?"profile":"choice");
    if(!dialog.open)dialog.showModal();
  });
  $(".lmk-auth-close").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
  emailBtn.addEventListener("click",()=>{showMode("login");form.querySelector('input[name="email"]').focus();});
  backBtn.addEventListener("click",()=>showMode("choice"));
  switchBtn.addEventListener("click",()=>showMode(mode==="register"?"login":"register"));
  forgotBtn.addEventListener("click",()=>showMode("reset"));
  googleBtn.addEventListener("click",async()=>{
    if(busy)return;
    setBusy(true);setMessage(t.processing);
    try{
      const provider=new GoogleAuthProvider();
      provider.setCustomParameters({prompt:"select_account"});
      await signInWithPopup(auth,provider);
      setMessage("");
    }catch(e){setMessage(firebaseError(e),true);}
    finally{setBusy(false);}
  });
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    if(busy)return;
    const email=form.elements.email.value.trim();
    const password=form.elements.password.value;
    if(!email)return;
    setBusy(true);setMessage(t.processing);
    try {
      if(mode==="reset"){
        await sendPasswordResetEmail(auth,email);
        showMode("login");
        setMessage(t.resetSent);
      }else if(mode==="register"){
        const cred=await createUserWithEmailAndPassword(auth,email,password);
        form.reset();
        try{await sendEmailVerification(cred.user);setMessage(t.emailVerification);}
        catch(e){setMessage(firebaseError(e),true);}
      }else{
        await signInWithEmailAndPassword(auth,email,password);
        form.reset();
        setMessage("");
      }
    }catch(e){setMessage(firebaseError(e),true);}
    finally{setBusy(false);}
  });
  verifyBtn.addEventListener("click",async()=>{
    if(!auth.currentUser||busy)return;
    setBusy(true);
    try{await sendEmailVerification(auth.currentUser);setMessage(t.verifyAgain);}
    catch(e){setMessage(firebaseError(e),true);}
    finally{setBusy(false);}
  });
  signoutBtn.addEventListener("click",async()=>{
    if(busy)return;
    setBusy(true);
    try{await signOut(auth);setMessage("");}catch(e){setMessage(firebaseError(e),true);}
    finally{setBusy(false);}
  });
  onAuthStateChanged(auth,renderUser,e=>{console.warn("Lumekori auth state error:",e?.code||"unknown");setMessage(t.unavailable,true);});
}
