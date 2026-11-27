// 1. 2-second splash screen
setTimeout(() => {
  const splash = document.getElementById("splashScreen");
  if (splash) splash.classList.add("hidden");
}, 2000);

// 2. Dark / Light mode toggle (persisted in localStorage)
const modeBtn = document.getElementById("modeBtn");

function updateModeText() {
  const isDark = document.body.classList.contains("dark");
  modeBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
}

if (localStorage.getItem("spaDark") === "true") {
  document.body.classList.add("dark");
}
updateModeText();

modeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("spaDark", document.body.classList.contains("dark"));
  updateModeText();
});

// 3. Log in / Create Account modal & session state
const authModal = document.getElementById("authModal");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userBadge = document.getElementById("userBadge");
const backHomeBtn = document.getElementById("backHomeBtn");
const showLoginTab = document.getElementById("showLoginTab");
const showCreateTab = document.getElementById("showCreateTab");
const loginForm = document.getElementById("loginForm");
const createForm = document.getElementById("createForm");
const loginMsg = document.getElementById("loginMsg");
const createMsg = document.getElementById("createMsg");

const getUsers = () => JSON.parse(localStorage.getItem("spaUsers")) ?? [];

function syncAuthUI() {
  const currentUser = JSON.parse(localStorage.getItem("spaCurrentUser"));
  if (currentUser) {
    userBadge.textContent = `Signed in as ${currentUser.name}`;
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    userBadge.textContent = "";
    loginBtn.style.display = "inline-block";
    registerBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}
syncAuthUI();

function openLogin() {
  loginMsg.textContent = "";
  createMsg.textContent = "";
  showLoginTab.classList.add("active");
  showCreateTab.classList.remove("active");
  loginForm.style.display = "flex";
  createForm.style.display = "none";
  authModal.style.display = "flex";
}

function openCreate() {
  loginMsg.textContent = "";
  createMsg.textContent = "";
  showCreateTab.classList.add("active");
  showLoginTab.classList.remove("active");
  createForm.style.display = "flex";
  loginForm.style.display = "none";
  authModal.style.display = "flex";
}

loginBtn.addEventListener("click", openLogin);
registerBtn.addEventListener("click", openCreate);
showLoginTab.addEventListener("click", openLogin);
showCreateTab.addEventListener("click", openCreate);

backHomeBtn.addEventListener("click", () => {
  authModal.style.display = "none";
});

authModal.addEventListener("click", (e) => {
  if (e.target === authModal) authModal.style.display = "none";
});

createForm.addEventListener("submit", (e) => {
  e.preventDefault();
  createMsg.textContent = "";

  const name = document.getElementById("createName").value.trim();
  const email = document.getElementById("createUser").value.trim().toLowerCase();
  const password = document.getElementById("createPass").value;

  if (password.length < 8) {
    createMsg.textContent = "Password must be at least 8 characters.";
    return;
  }

  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    createMsg.textContent = "Email is already registered.";
    return;
  }

  localStorage.setItem("spaUsers", JSON.stringify([...users, { name, email, password }]));
  createForm.reset();
  openLogin();
  loginMsg.textContent = "Account created! Please log in.";
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  loginMsg.textContent = "";

  const email = document.getElementById("loginUser").value.trim().toLowerCase();
  const password = document.getElementById("loginPass").value;
  const user = getUsers().find((u) => u.email === email && u.password === password);

  if (!user) {
    loginMsg.textContent = "Invalid email or password.";
    return;
  }

  localStorage.setItem("spaCurrentUser", JSON.stringify(user));
  loginForm.reset();
  authModal.style.display = "none";
  syncAuthUI();
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("spaCurrentUser");
  syncAuthUI();
});

// 4. Live search filter on Campus Notices
const noticeSearch = document.getElementById("noticeSearch");
const noticesContainer = document.querySelector(".notices");

noticeSearch.addEventListener("input", () => {
  const query = noticeSearch.value.trim().toLowerCase();
  const cards = noticesContainer.querySelectorAll(".notice");

  cards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent.toLowerCase() ?? "";
    const tag = card.querySelector(".tag")?.textContent.toLowerCase() ?? "";
    const body = card.querySelector("p:last-of-type")?.textContent.toLowerCase() ?? "";
    const matches = title.includes(query) || tag.includes(query) || body.includes(query);
    card.style.display = matches ? "" : "none";
  });
});

// 5. Add new notice from the "Post a Notice" form
const noticeForm = document.getElementById("noticeForm");

noticeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const rawDate = document.getElementById("date").value;
  const message = document.getElementById("message").value.trim();

  const formattedDate = rawDate
    ? new Date(`${rawDate}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Today";

  const article = document.createElement("article");
  article.className = "notice";
  article.innerHTML = `
    <h3></h3>
    <p class="meta">
      <time datetime="${rawDate}">${formattedDate}</time>
      <span class="tag"></span>
    </p>
    <p></p>
  `;

  article.querySelector("h3").textContent = title;
  article.querySelector(".tag").textContent = category;
  article.querySelector("p:last-of-type").textContent = message;

  noticesContainer.prepend(article);
  noticeForm.reset();
});