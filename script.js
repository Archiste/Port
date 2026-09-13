const nav = document.querySelector(".nav");
const menuToggle = document.querySelector(".menu-toggle");

const modal = document.querySelector("#modal");
const modalTitle = document.querySelector("#modal-title");
const modalDescription = document.querySelector("#modal-description");
const modalLink = document.querySelector("#modal-link");
const closeButton = document.querySelector(".close");

const cursorGlow = document.querySelector(".cursor-glow");
const sideRail = document.querySelector(".side-rail");
const welcomeScreen = document.querySelector("#welcome-screen");
const discordStatus = document.querySelector("#discord-status");
const discordLink = document.querySelector("#discord-link");
const discordActivity = document.querySelector("#discord-activity");
const copyFeedback = document.querySelector("#copy-feedback");
let pointerY = window.innerHeight / 2;
let audioContext = null;

const DISCORD_ID = "659094544939352064";

function copyDiscordUsername() {
  const username = discordLink?.dataset?.username || "archiste";

  if (!navigator.clipboard) {
    return;
  }

  navigator.clipboard.writeText(username).catch(() => {});

  if (copyFeedback) {
    copyFeedback.textContent = "Pseudo copié";
    copyFeedback.classList.add("show");
    clearTimeout(copyFeedback._timer);
    copyFeedback._timer = setTimeout(() => {
      copyFeedback.classList.remove("show");
    }, 1200);
  }
}

if (discordLink) {
  discordLink.addEventListener("click", event => {
    event.preventDefault();
    copyDiscordUsername();
  });
}

async function updateDiscordStatus() {
  if (!discordStatus || !discordLink) {
    return;
  }

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error("Impossible de récupérer le statut Discord");
    }

    const user = data.data.discord_user;
    const presence = data.data.discord_status;
    const activities = data.data.activities || [];
    const username = user?.username ? user.username : "Discord";

    discordLink.title = username;
    discordLink.dataset.username = username;
    discordLink.textContent = `DISCORD • ${username}`;

    const statusMap = {
      online: "En ligne",
      idle: "Absent",
      dnd: "Ne pas déranger",
      offline: "Hors ligne"
    };

    const activity = activities.find(activity => activity.type !== 4) || activities[0];

    if (activity && activity.name) {
      const detail = activity.details ? ` • ${activity.details}` : "";
      const state = activity.state ? ` • ${activity.state}` : "";
      discordActivity.textContent = `ACTIVITÉ : ${activity.name}${detail}${state}`;
    } else {
      discordActivity.textContent = "ACTIVITÉ : Aucune activité détectée";
    }

    discordStatus.textContent = `STATUT : ${statusMap[presence] || "Inconnu"}`;
    discordStatus.className = `discord-status ${presence || "offline"}`;
  } catch (error) {
    discordStatus.textContent = "STATUT : Indisponible";
    discordStatus.className = "discord-status offline";
    discordActivity.textContent = "ACTIVITÉ : non disponible";
  }
}

window.addEventListener("load", () => {
  updateDiscordStatus();
});

if (welcomeScreen) {
  welcomeScreen.addEventListener("click", () => {
    welcomeScreen.classList.add("hidden");
    playHoverTone();
  });
}

function getAudioContext() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;

  if (!AudioCtor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioCtor();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playHoverTone() {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(240, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(520, context.currentTime + 0.12);

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.04, context.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.2);
}

function updateSideRail() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  document.documentElement.style.setProperty("--rail-progress", Math.min(Math.max(progress, 0), 100));

  if (sideRail) {
    const drift = ((pointerY / window.innerHeight) - 0.5) * 24;
    sideRail.style.transform = `translateY(calc(-50% + ${drift}px))`;
  }
}

window.addEventListener("mousemove", event => {
  pointerY = event.clientY;
  updateSideRail();
});

window.addEventListener("scroll", updateSideRail, { passive: true });
window.addEventListener("resize", updateSideRail);
updateSideRail();

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
  });
});


document.querySelectorAll(".project").forEach(project => {

  const button = project.querySelector(".view-project");

  button.addEventListener("click", () => {

    const title = project.dataset.title;
    const description = project.dataset.description;
    const link = project.dataset.link?.trim();

    modalTitle.textContent = title;
    modalDescription.textContent = description;

    if (link) {
      modalLink.href = link;
      modalLink.target = "_blank";
      modalLink.rel = "noopener noreferrer";
      modalLink.hidden = false;
      modalLink.textContent = "Voir le site";
    } else {
      modalLink.href = "#";
      modalLink.target = "_self";
      modalLink.rel = "";
      modalLink.hidden = true;
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
  });

});


function closeModal() {

  modal.classList.remove("open");

  modal.setAttribute("aria-hidden", "true");
  modalLink.href = "#";
  modalLink.target = "_self";
  modalLink.rel = "";
  modalLink.hidden = true;

  document.body.style.overflow = "";
}


closeButton.addEventListener("click", closeModal);


modal.addEventListener("click", event => {

  if (event.target === modal) {
    closeModal();
  }

});


document.addEventListener("keydown", event => {

  if (event.key === "Escape") {
    closeModal();
  }

});


window.addEventListener("mousemove", event => {

  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;

});


const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}


const revealElements = document.querySelectorAll(
  ".section-heading, .about-grid, .project, .skill-line, .contact"
);


revealElements.forEach(element => {
  element.classList.add("reveal");
});


const observer = new IntersectionObserver(
  entries => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        entry.target.classList.add("visible");

        observer.unobserve(entry.target);

      }

    });

  },
  {
    threshold: 0.12
  }
);


revealElements.forEach(element => {
  observer.observe(element);
});

const mainSigil = document.querySelector(".sigil-main");

window.addEventListener("mousemove", event => {

  if (!mainSigil || window.innerWidth < 800) {
    return;
  }

  const x =
    (event.clientX / window.innerWidth - 0.5) * 20;

  const y =
    (event.clientY / window.innerHeight - 0.5) * 20;

  mainSigil.style.marginLeft = `${x}px`;
  mainSigil.style.marginTop = `${y}px`;

});

document.querySelectorAll(".project").forEach(project => {

  project.addEventListener("mouseenter", () => {
    project.classList.add("hovered");
    playHoverTone();
  });

  project.addEventListener("mouseleave", () => {
    project.classList.remove("hovered");
  });

});

const logo = document.querySelector(".logo");

if (logo) {

  setInterval(() => {

    if (Math.random() > 0.93) {

      logo.style.transform =
        `translateX(${Math.random() * 2 - 1}px)`;

      setTimeout(() => {
        logo.style.transform = "";
      }, 80);

    }

  }, 500);

}


document.querySelectorAll(".project-sigil").forEach(sigil => {

  sigil.addEventListener("mouseenter", () => {
    sigil.style.transform = "rotate(180deg) scale(1.15)";
  });

  sigil.addEventListener("mouseleave", () => {
    sigil.style.transform = "";
  });

});
