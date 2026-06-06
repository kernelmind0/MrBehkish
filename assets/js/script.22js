// =============================
// CONFIG
// =============================

const CONFIG = {
    MOCK_API_BASE: "https://6a231d705c610353286ab91f.mockapi.io/teacherAPI",

    EMAILJS_SERVICE_ID: "service_gckex2l",
    EMAILJS_TEMPLATE_ID: "template_627ux5g",
    EMAILJS_PUBLIC_KEY: "d5XD4o5a5RHRB90ke"
};


// =============================
// INIT
// =============================

document.addEventListener("DOMContentLoaded", () => {

    if (typeof emailjs !== "undefined") {
        emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
    }

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", handleContactSubmit);
    }

    const messagesList = document.getElementById("messagesList");
    if (messagesList) {
        loadDashboardMessages();
    }

    const refreshMessagesBtn = document.getElementById("refreshMessagesBtn");
    if (refreshMessagesBtn) {
        refreshMessagesBtn.addEventListener("click", loadDashboardMessages);
    }

    const coursesPage = document.getElementById("courses-list");
    if (coursesPage) {
        loadCourses();
    }

    const dashboardCourses = document.getElementById("dashboard-courses-list");
    if (dashboardCourses) {
        loadDashboardCourses();
    }

    updateAuthLink();
});


// =============================
// CONTACT FORM
// =============================

async function handleContactSubmit(event) {

    event.preventDefault();

    const sendBtn = document.getElementById("sendBtn");
    const statusEl = document.getElementById("contactStatus");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !subject || !message) {
        statusEl.textContent = "لطفاً همه فیلدها را کامل کنید.";
        statusEl.className = "status error";
        return;
    }

    const payload = {
        name,
        email,
        subject,
        message,
        createdAt: new Date().toLocaleString("fa-IR"),
        isRead: false
    };

    try {

        sendBtn.disabled = true;
        sendBtn.textContent = "در حال ارسال...";

        await saveMessageToMockAPI(payload);

        await emailjs.send(
            CONFIG.EMAILJS_SERVICE_ID,
            CONFIG.EMAILJS_TEMPLATE_ID,
            payload
        );

        statusEl.textContent = "پیام شما با موفقیت ارسال شد.";
        statusEl.className = "status success";

        event.target.reset();

    } catch (error) {

        console.error(error);

        statusEl.textContent = "خطا در ارسال پیام.";
        statusEl.className = "status error";

    } finally {

        sendBtn.disabled = false;
        sendBtn.textContent = "ارسال پیام";
    }
}


async function saveMessageToMockAPI(data) {

    const res = await fetch(`${CONFIG.MOCK_API_BASE}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw new Error("خطا در ذخیره پیام");
    }

    return res.json();
}


// =============================
// DASHBOARD MESSAGES
// =============================

async function loadDashboardMessages() {

    const container = document.getElementById("messagesList");

    container.innerHTML = "<p>در حال دریافت پیام‌ها...</p>";

    try {

        const res = await fetch(`${CONFIG.MOCK_API_BASE}/messages`);
        const messages = await res.json();

        if (messages.length === 0) {
            container.innerHTML = "<p>پیامی وجود ندارد.</p>";
            return;
        }

        messages.reverse();

        container.innerHTML = messages.map(item => `
        <article class="message-card ${item.isRead ? "read" : "unread"}">

            <h3>${escapeHTML(item.subject)}</h3>

            <p><b>${escapeHTML(item.name)}</b></p>
            <p>${escapeHTML(item.email)}</p>

            <p>${escapeHTML(item.message)}</p>

            <button onclick="markMessageAsRead('${item.id}')">خوانده شد</button>
            <button onclick="deleteMessage('${item.id}')">حذف</button>

        </article>
        `).join("");

    } catch (error) {

        console.error(error);
        container.innerHTML = "خطا در دریافت پیام‌ها";

    }
}


async function deleteMessage(id) {

    if (!confirm("از حذف پیام مطمئن هستید؟")) return;

    await fetch(`${CONFIG.MOCK_API_BASE}/messages/${id}`, {
        method: "DELETE"
    });

    loadDashboardMessages();
}


async function markMessageAsRead(id) {

    await fetch(`${CONFIG.MOCK_API_BASE}/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true })
    });

    loadDashboardMessages();
}


// =============================
// COURSES (PUBLIC PAGE)
// =============================

async function loadCourses() {

    const container = document.getElementById("courses-list");

    container.innerHTML = "<p>در حال دریافت دروس...</p>";

    try {

        const res = await fetch(`${CONFIG.MOCK_API_BASE}/notes`);
        const courses = await res.json();

        container.innerHTML = "";

        courses.reverse().forEach(course => {

            container.innerHTML += `

            <div class="courses-desc-box">

                <h2 class="courses-desc-box-heading">
                    ${escapeHTML(course.title)}
                </h2>

                <p class="courses-desc-box-item">
                    ${escapeHTML(course.description)}
                </p>

                <a href="${course.link}" target="_blank">
                    دانلود فایل
                </a>

            </div>

            `;

        });

    } catch (error) {

        console.error(error);
        container.innerHTML = "خطا در دریافت دروس";

    }
}


// =============================
// COURSES DASHBOARD
// =============================

async function loadDashboardCourses() {

    const container = document.getElementById("dashboard-courses-list");

    container.innerHTML = "در حال دریافت دروس...";

    try {

        const res = await fetch(`${CONFIG.MOCK_API_BASE}/notes`);
        const courses = await res.json();

        container.innerHTML = "<h3>لیست دروس ثبت شده</h3>";

        courses.reverse().forEach(course => {

            container.innerHTML += `

            <div class="course-card">

                <strong>${escapeHTML(course.title)}</strong>

                <p>${escapeHTML(course.description)}</p>

                <a href="${course.link}" target="_blank">مشاهده فایل</a>

                <br><br>

                <button onclick="deleteCourse('${course.id}')">
                حذف
                </button>

            </div>

            `;

        });

    } catch (error) {

        console.error(error);
        container.innerHTML = "خطا در دریافت دروس";

    }
}


async function addNewCourse() {

    const title = document.getElementById("courseTitle").value.trim();
    const description = document.getElementById("courseDescription").value.trim();
    const link = document.getElementById("courseLink").value.trim();

    if (!title || !description || !link) {
        alert("همه فیلدها را پر کنید");
        return;
    }

    await fetch(`${CONFIG.MOCK_API_BASE}/notes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            description,
            link
        })
    });

    alert("درس اضافه شد");

    loadDashboardCourses();
}


async function deleteCourse(id) {

    if (!confirm("از حذف درس مطمئن هستید؟")) return;

    await fetch(`${CONFIG.MOCK_API_BASE}/notes/${id}`, {
        method: "DELETE"
    });

    loadDashboardCourses();
}


// =============================
// LOGIN
// =============================

function handleLogin() {

    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    const ADMIN_USER = "admin";
    const ADMIN_PASS = "123456";

    if (user === ADMIN_USER && pass === ADMIN_PASS) {

        localStorage.setItem("isLoggedIn", "true");

        window.location.href = "teacher-dashboard.html";

    } else {

        alert("اطلاعات ورود اشتباه است");

    }
}


function logout() {

    localStorage.removeItem("isLoggedIn");

    window.location.href = "index.html";
}


// =============================
// HEADER AUTH ICON
// =============================

function updateAuthLink() {

    const authLink = document.getElementById("authLink");

    if (!authLink) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {

        authLink.href = "teacher-dashboard.html";
        authLink.innerHTML = "پنل استاد";

    } else {

        authLink.href = "login.html";
        authLink.innerHTML = "ورود استاد";

    }
}


// =============================
// SECURITY
// =============================

if (
    document.getElementById("dashboard-courses-list") &&
    localStorage.getItem("isLoggedIn") !== "true"
) {
    window.location.href = "login.html";
}


// =============================
// XSS PROTECTION
// =============================

function escapeHTML(value) {

    if (!value) return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
