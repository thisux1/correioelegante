// Declarações globais do seu projeto
const quizQuestions = [
  {
    question: "Qual é a minha flor favorita que você já me deu vontade de encher a casa com ela?",
    options: ["Rosa", "Margarida", "Girassol", "Tulipa"],
    answer: "Margarida"
  },
  {
    question: "Qual filme eu assistiria mil vezes com você em uma cabana na neve?",
    options: ["Titanic", "Gente Grande", "De Volta para o Futuro", "V de Vingança"],
    answer: "Gente Grande"
  },
  {
    question: "Qual comida eu pediria se fossemos fazer um piquenique só nós dois?",
    options: ["Pizza", "Hambúrguer caseiro", "Bolinhas de queijo", "Sushi"],
    answer: "Pizza"
  },
  {
    question: "Qual cidade eu sonharia em explorar com você de mãos dadas?",
    options: ["Paris", "Istambul", "Nova York", "Londres"],
    answer: "Istambul"
  },
  {
    question: "Qual foi o dia em que eu ouvi sua voz pela primeira vez e virou meu som favorito?",
    options: ["4 de abril", "22 de maio", "19 de julho", "14 de fevereiro"],
    answer: "19 de julho"
  }
];

let currentQuestion = 0;
let score = 0;
const dataEspecifica = new Date('2024-04-04T00:00:00');
const minutosSerie = (3 * 24 * 60) + (4 * 60) + 16; // 4576 minutos

// Variáveis do carrossel (baseadas no CodePen)
var radius = 400; // Raio do carrossel
var autoRotate = true; // Rotação automática
var rotateSpeed = -60; // Velocidade da rotação (segundos por 360°)
var imgWidth = 120; // Largura das imagens
var imgHeight = 170; // Altura das imagens
var bgMusicURL = null; // Música de fundo desativada por padrão
var bgMusicControls = true;

// Funções auxiliares do seu projeto
function updateZIndex() {
  const items = Array.from(document.querySelectorAll('#spin-container img:not(#divcarta img)'));
  const zValues = items.map(item => {
    const style = window.getComputedStyle(item);
    const transform = style.transform;
    const zMatch = transform.match(/translateZ\(([^)]+)\)/);
    const z = zMatch ? parseFloat(zMatch[1]) : 0;
    return z;
  });

  const itemsWithZ = items.map((item, index) => [item, zValues[index]]);
  itemsWithZ.sort((a, b) => a[1] - b[1]);
  itemsWithZ.forEach((pair, index) => {
    pair[0].style.zIndex = index;
  });

  requestAnimationFrame(updateZIndex);
}

function atualizarCronometro() {
  const agora = new Date();
  const diferenca = agora - dataEspecifica;
  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

  document.getElementById('dias').textContent = dias;
  document.getElementById('horas').textContent = horas;
  document.getElementById('minutos').textContent = minutos;
  document.getElementById('segundos').textContent = segundos;

  const totalMinutosDecorridos = Math.floor(diferenca / (1000 * 60));
  const vezesSerie = Math.floor(totalMinutosDecorridos / minutosSerie);
  document.getElementById('vezes-serie').textContent = vezesSerie;
}

function animarCaneta(timestamp) {
  const revealRect = document.getElementById("reveal-rect");
  const caneta = document.getElementById("caneta");
  const duracao = 3500;
  if (!window.inicio) window.inicio = timestamp;
  const progresso = timestamp - window.inicio;
  const percent = Math.min(progresso / duracao, 1);

  revealRect.setAttribute("width", percent * 600);

  const posicoes = [
    { left: 10, top: 140 },
    { left: 150, top: 80 },
    { left: 300, top: 50 },
    { left: 450, top: 80 },
    { left: 600, top: 140 }
  ];

  const index = Math.floor(percent * (posicoes.length - 1));
  const nextIndex = Math.min(index + 1, posicoes.length - 1);
  const interp = (percent * (posicoes.length - 1)) % 1;

  caneta.style.left = `${posicoes[index].left + (posicoes[nextIndex].left - posicoes[index].left) * interp}px`;
  caneta.style.top = `${posicoes[index].top + (posicoes[nextIndex].top - posicoes[index].top) * interp}px`;

  if (percent < 1) {
    requestAnimationFrame(animarCaneta);
  } else {
    caneta.classList.add('hidden');
  }
}

function preloadImages() {
  // Coleta todas as imagens com data-src (lazy loading) e src (carregamento direto)
  const images = Array.from(document.querySelectorAll('img[data-src], img[src]'))
    .map(img => img.getAttribute('data-src') || img.getAttribute('src'))
    .filter(src => src); // Remove valores nulos ou undefined

  // Retorna uma Promise que pré-carrega todas as imagens
  return Promise.all(
    images.map(src =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      })
    )
  );
}

function showScreen(hideElement, showElement) {
  hideElement.classList.add('hidden');
  hideElement.classList.remove('visible');
  setTimeout(() => {
    showElement.classList.remove('hidden');
    showElement.classList.add('visible');
  }, 500);
}

function checkAllLoaded(assetsLoaded, particlesLoaded, loadingStartTime, minLoadingTime) {
  if (assetsLoaded && particlesLoaded) {
    const elapsedTime = Date.now() - loadingStartTime;
    const executeTransition = () => {
      showScreen(
        document.querySelector('.loading-screen'),
        document.querySelector('.present-screen')
      );
      new GiftBoxAnimation();
    };
    if (elapsedTime >= minLoadingTime) {
      executeTransition();
    } else {
      setTimeout(executeTransition, minLoadingTime - elapsedTime);
    }
  }
}

function showQuestion() {
  const questionContainer = document.getElementById('questionContainer');
  const question = quizQuestions[currentQuestion];
  questionContainer.innerHTML = `
    <h3 class="fancyh3 fade-in" id="question">${question.question}</h3>
    ${question.options.map(option => `
      <button class="option" onclick="selectAnswer('${option}')">${option}</button>
    `).join('')}
  `;
}

function selectAnswer(selected) {
  const question = quizQuestions[currentQuestion];
  if (selected === question.answer) score++;
  document.getElementById('nextButton').classList.remove('hidden');
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < quizQuestions.length) {
    showQuestion();
    document.getElementById('nextButton').classList.add('hidden');
  } else {
    showResult();
  }
}

function showResult() {
  const result = document.getElementById('result');
  result.classList.remove('hidden');
  result.classList.add('fade-in');
  document.getElementById('questionContainer').classList.add('hidden');
  document.getElementById('nextButton').classList.add('hidden');
}

// Funções do Carrossel (adaptadas do CodePen com animação corrigida)
function initCarousel(delayTime) {
  const aImg = ospin.getElementsByTagName('img');
  const aVid = ospin.getElementsByTagName('video');
  const aEle = [...aImg, ...aVid];

  // Estado inicial: todas as imagens no centro
  for (var i = 0; i < aEle.length; i++) {
    aEle[i].style.transform = `rotateY(${i * (360 / aEle.length)}deg) translateZ(0px) scale(0.5)`; // Escala inicial para efeito
    aEle[i].style.transition = "transform 1s ease-out, scale 1s ease-out";
    aEle[i].style.transitionDelay = delayTime || (aEle.length - i) / 4 + "s";
  }

  // Após um pequeno atraso, expande para o raio final
  setTimeout(() => {
    for (var i = 0; i < aEle.length; i++) {
      aEle[i].style.transform = `rotateY(${i * (360 / aEle.length)}deg) translateZ(${radius}px) scale(1)`;
    }
  }, 50);
}

function applyTransform(obj) {
  if (tY > 180) tY = 180;
  if (tY < 0) tY = 0;
  obj.style.transform = `rotateX(${-tY}deg) rotateY(${tX}deg)`;
}

function playSpin(yes) {
  ospin.style.animationPlayState = yes ? 'running' : 'paused';
}

// Variáveis globais do carrossel
var odrag = document.getElementById('drag-container');
var ospin = document.getElementById('spin-container');
var sX, sY, nX, nY, desX = 0, desY = 0, tX = 0, tY = 10;

// Classes do seu projeto
class ParticleSystem {
  constructor() {
    this.container = document.getElementById('particles-container');
    this.maxParticles = 100;
    this.particles = [];
    this.init();
  }

  init() {
    for (let i = 0; i < this.maxParticles; i++) {
      const particle = document.createElement('div');
      particle.className = 'heart-particle';
      this.container.appendChild(particle);
      this.particles.push({ element: particle, active: false });
    }
    this.spawnParticles();
    this.animate();
    this.addInteractivity();
  }

  spawnParticles() {
    setInterval(() => {
      const inactiveParticle = this.particles.find(p => !p.active);
      if (inactiveParticle) {
        this.activateParticle(inactiveParticle.element);
        inactiveParticle.active = true;
      }
    }, 500);
  }

  activateParticle(particle) {
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + 20;
    const speed = 1 + Math.random() * 2;
    particle.style.animation = `float ${speed}s linear infinite, spin ${speed}s linear infinite`;
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.setProperty('--hue', Math.random() * 360);
    particle.style.animation = 'none';
    particle.offsetHeight;
    particle.style.animation = `float ${9 + Math.random() * 7}s linear infinite, spin`;
    particle.dataset.active = 'true';
    setTimeout(() => { particle.dataset.active = 'false'; }, 7000);
  }

  animate() {
    const updateParticles = () => {
      this.particles.forEach(p => {
        if (p.element.dataset.active === 'true') {
          const rect = p.element.getBoundingClientRect();
          if (rect.top + rect.height < 0) {
            p.element.dataset.active = 'false';
          }
        }
      });
      requestAnimationFrame(updateParticles);
    };
    updateParticles();
  }

  addInteractivity() {
    this.container.addEventListener('mousemove', (e) => {
      this.particles.forEach(p => {
        if (p.element.dataset.active === 'true') {
          const rect = p.element.getBoundingClientRect();
          const distance = Math.hypot(
            e.clientX - (rect.left + rect.width / 2),
            e.clientY - (rect.top + rect.height / 2)
          );
          if (distance < 50) {
            p.element.style.transform = `scale(1.2) rotate(${distance * 0.5}deg)`;
          }
        }
      });
    });

    this.container.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.particles.forEach(p => {
        if (p.element.dataset.active === 'true') {
          const rect = p.element.getBoundingClientRect();
          if (
            touch.clientX > rect.left &&
            touch.clientX < rect.right &&
            touch.clientY > rect.top &&
            touch.clientY < rect.bottom
          ) {
            p.element.style.transform = "scale(1.5) rotate(30deg)";
            setTimeout(() => {
              p.element.style.transform = "scale(1) rotate(0deg)";
            }, 300);
          }
        }
      });
    });
  }
}

class GiftBoxAnimation {
  constructor() {
    this.state = {
      move: "move",
      jump: "",
      rotated: "",
      rotating: ""
    };
    this.confettiActive = false;
    this.confettiElements = [];
    this.animations = [];
    this.timeoutJump = null;
    this.timeoutRotated = null;
    this.animating = false;

    this.initElements();
    this.addEventListeners();
    this.updateElements();
  }

  initElements() {
    this.lid = document.querySelector('.lid');
    this.kuku = document.querySelector('.kuku');
    this.box = document.querySelector('.box');
    this.confettiContainer = document.createElement('div');
    this.confettiContainer.className = 'confetti';
    document.body.appendChild(this.confettiContainer);
  }

  addEventListeners() {
    this.box.addEventListener('click', () => this.handleClick());
  }

  handleClick() {
    if (this.animating) return;
    this.animating = true;

    if (this.state.rotated === "rotated") {
      this.cancelAnimation();
      setTimeout(() => { this.animating = false; }, 300);
    } else {
      this.startAnimation();
      setTimeout(() => { this.animating = false; }, 1500);
    }
  }

  cancelAnimation() {
    clearTimeout(this.timeoutJump);
    clearTimeout(this.timeoutRotated);
    this.stopConfetti();
    this.resetState();
  }

  startAnimation() {
    this.setState({ rotating: "rotating" });
    this.timeoutJump = setTimeout(() => {
      this.setState({ jump: "jump" });
      this.createConfetti();
    }, 300);
    this.timeoutRotated = setTimeout(() => {
      this.setState({ rotated: "rotated" });
    }, 1000);

    const moving = this.state.move === "move" ? "" : "move";
    this.setState({ move: moving });
  }

  createConfetti() {
    this.confettiActive = true;
    this.confettiContainer.innerHTML = '';
    this.confettiElements = [];
    this.animations = [];

    const presentRect = this.box.getBoundingClientRect();
    const startX = presentRect.left + presentRect.width / 2;
    const startY = presentRect.top;

    for (let i = 0; i < 25; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;

      const baseAngle = Math.PI / 2;
      const angleVariation = (Math.random() - 0.5) * Math.PI;
      const angle = baseAngle + angleVariation;
      const velocity = 2 + Math.random() * 4;
      const dx = Math.cos(angle) * velocity;
      const dy = -Math.sin(angle) * velocity;
      const rotation = (Math.random() - 0.5) * 360;
      const scale = 0.5 + Math.random() * 0.5;

      const animation = gsap.to(particle, {
        x: `+=${dx * 100}`,
        y: `+=${dy * 100}`,
        rotation: rotation,
        scale: scale,
        duration: 2.5,
        ease: "power1.out",
        onComplete: () => particle.remove(),
        onUpdate: function () {
          gsap.set(particle, { rotation: this.targets()[0].rotation });
        }
      });

      this.confettiElements.push(particle);
      this.animations.push(animation);
      this.confettiContainer.appendChild(particle);
    }
  }

  stopConfetti() {
    this.confettiActive = false;
    this.animations.forEach(animation => animation.kill());
    this.confettiElements.forEach(particle => particle.remove());
    this.confettiElements = [];
    this.animations = [];
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateElements();
  }

  resetState() {
    clearTimeout(this.timeoutJump);
    clearTimeout(this.timeoutRotated);
    this.state = {
      move: "move",
      jump: "",
      rotated: "",
      rotating: ""
    };
    this.updateElements();
  }

  updateElements() {
    this.lid.className = `lid ${this.state.move} ${this.state.rotating} ${this.state.rotated}`;
    this.kuku.className = `kuku ${this.state.jump}`;
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Garantir que main-content comece oculto
  const mainContent = document.querySelector('.main-content');
  if (!mainContent.classList.contains('hidden')) {
    mainContent.classList.add('hidden');
  }

  // Configuração do carrossel
  const aImg = ospin.getElementsByTagName('img');
  const aVid = ospin.getElementsByTagName('video');
  const aEle = [...aImg, ...aVid];

  // Estado inicial das imagens no centro
  for (var i = 0; i < aEle.length; i++) {
    aEle[i].style.transform = `rotateY(${i * (360 / aEle.length)}deg) translateZ(0px) scale(0.5)`;
  }

  ospin.style.width = `${imgWidth}px`;
  ospin.style.height = `${imgHeight}px`;
  ground.style.width = `${radius * 3}px`;
  ground.style.height = `${radius * 3}px`;

  setTimeout(() => initCarousel(1), 1000); // Animação inicial após 1s

  if (autoRotate) {
    const animationName = rotateSpeed > 0 ? 'spin' : 'spinRevert';
    ospin.style.animation = `${animationName} ${Math.abs(rotateSpeed)}s infinite linear`;
  }

  if (bgMusicURL) {
    document.getElementById('music-container').innerHTML += `
      <audio src="${bgMusicURL}" ${bgMusicControls ? 'controls' : ''} autoplay loop>
        <p>If you are reading this, it is because your browser does not support the audio element.</p>
      </audio>
    `;
  }

  // Eventos de arrasto (direto do CodePen, com suporte a touch)
  odrag.onpointerdown = function (e) {
    clearInterval(odrag.timer);
    e = e || window.event;
    sX = e.clientX;
    sY = e.clientY;

    this.onpointermove = function (e) {
      e = e || window.event;
      nX = e.clientX;
      nY = e.clientY;
      desX = nX - sX;
      desY = nY - sY;
      tX += desX * 0.1;
      tY += desY * 0.1;
      applyTransform(odrag);
      sX = nX;
      sY = nY;
    };

    this.onpointerup = function (e) {
      odrag.timer = setInterval(function () {
        desX *= 0.95;
        desY *= 0.95;
        tX += desX * 0.1;
        tY += desY * 0.1;
        applyTransform(odrag);
        playSpin(false);
        if (Math.abs(desX) < 0.5 && Math.abs(desY) < 0.5) {
          clearInterval(odrag.timer);
          playSpin(true);
        }
      }, 17);
      this.onpointermove = this.onpointerup = null;
    };

    return false;
  };

  odrag.addEventListener('touchstart', function (e) {
    clearInterval(odrag.timer);
    e.preventDefault();
    var touch = e.touches[0];
    sX = touch.clientX;
    sY = touch.clientY;

    function touchMove(e) {
      e.preventDefault();
      var touch = e.touches[0];
      nX = touch.clientX;
      nY = touch.clientY;
      desX = nX - sX;
      desY = nY - sY;
      tX += desX * 0.1;
      tY += desY * 0.1;
      applyTransform(odrag);
      sX = nX;
      sY = nY;
    }

    function touchEnd() {
      odrag.timer = setInterval(function () {
        desX *= 0.95;
        desY *= 0.95;
        tX += desX * 0.1;
        tY += desY * 0.1;
        applyTransform(odrag);
        playSpin(false);
        if (Math.abs(desX) < 0.5 && Math.abs(desY) < 0.5) {
          clearInterval(odrag.timer);
          playSpin(true);
        }
      }, 17);
      odrag.removeEventListener('touchmove', touchMove);
      odrag.removeEventListener('touchend', touchEnd);
    }

    odrag.addEventListener('touchmove', touchMove);
    odrag.addEventListener('touchend', touchEnd);
  });

  document.onmousewheel = function (e) {
    e = e || window.event;
    var d = e.wheelDelta / 10 || -e.detail;
    radius += d;
    
    initCarousel(1);
  };

  // Cronômetro
  atualizarCronometro();
  setInterval(atualizarCronometro, 1000);

  // Animação da caneta
  requestAnimationFrame(animarCaneta);

  // Recursos e eventos
  let assetsLoaded = false;
  let particlesLoaded = false;
  const loadingStartTime = Date.now();
  const minLoadingTime = 2000;

  const initParticles = () => {
    particlesLoaded = true;
    new ParticleSystem();
    checkAllLoaded(assetsLoaded, particlesLoaded, loadingStartTime, minLoadingTime);
  };

  const particlesCheck = setInterval(() => {
    if (typeof particlesJS !== 'undefined') {
      clearInterval(particlesCheck);
      initParticles();
    }
  }, 100);

  const initPresentEvents = () => {
    const presentBox = document.getElementById('presentBox');
    const openButton = document.getElementById('openButton');

    if (presentBox) {
      presentBox.addEventListener('mousemove', (e) => {
        const rect = presentBox.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angleX = (e.clientX - centerX) / 20;
        const angleY = (centerY - e.clientY) / 20;
        presentBox.style.transform = `perspective(1000px) rotateX(${angleY}deg) rotateY(${angleX}deg) scale(1.05)`;
      });
      presentBox.addEventListener('mouseleave', () => {
        presentBox.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    }

    if (openButton) {
      openButton.addEventListener('click', () => {
        showScreen(
          document.querySelector('.present-screen'),
          document.querySelector('.main-content')
        );
      });
    }
  };

  const initAnimations = () => {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      const card = document.querySelector('.card');
      if (card) {
        card.style.top = currentScroll > lastScroll ? "-90px" : "0";
      }
      lastScroll = currentScroll;
    });

    const observer = lozad('.lozad', {
      loaded: (el) => {
        if (el.dataset.src) el.src = el.dataset.src;
        el.style.opacity = 1;
        el.style.transform = 'scale(1)';
      }
    });
    observer.observe();

    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.parallax-item').forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          scrollTrigger: {
            trigger: item,
            start: "top 100%",
            toggleActions: "play reverse"
          }
        }
      );
      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          start: "top 50%",
          end: "top 0%",
          scrub: true
        },
        opacity: 0
      });
    });

    window.addEventListener('resize', () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.refresh());
    });
  };

  const initLoading = async () => {
    try {
      await preloadImages();
      assetsLoaded = true;
      checkAllLoaded(assetsLoaded, particlesLoaded, loadingStartTime, minLoadingTime);
    } catch (error) {
      console.error('Error loading images:', error);
      setTimeout(() => {
        assetsLoaded = true;
        checkAllLoaded(assetsLoaded, particlesLoaded, loadingStartTime, minLoadingTime);
      }, 3000);
    }
  };

  // Eventos do quiz
  document.getElementById('openQuiz').addEventListener('click', () => {
    document.getElementById('quizScreen').classList.remove('hidden');
    showQuestion();
  });

  document.getElementById('nextButton').addEventListener('click', nextQuestion);

  // Inicialização principal
  initLoading();
  initPresentEvents();
  initAnimations();
  window.giftAnimation = new GiftBoxAnimation();
});

// Inicia o z-index do carrossel
updateZIndex();