const MOCK_API_BASE = "https://6a231d705c610353286ab91f.mockapi.io/teacherAPI";
const CONFIG = {
    MOCK_API_BASE: "https://6a231d705c610353286ab91f.mockapi.io/teacherAPI",

    EMAILJS_SERVICE_ID: "service_gckex2l",
    EMAILJS_TEMPLATE_ID: "template_627ux5g",
    EMAILJS_PUBLIC_KEY: "d5XD4o5a5RHRB90ke"
};

const app = document.getElementById("app");


// =======================
// وقتی صفحه کامل لود شد
// اگر EmailJS در صفحه وجود داشت
// آن را با Public Key فعال کن
// اگر فرم تماس وجود داشت
// موقع submit تابع ارسال پیام اجرا شود
// =======================
//========================
//مقداردهی اولیه 
//emailjs
//========================

document.addEventListener("DOMContentLoaded", () => {
    if (typeof emailjs !== "undefined") {
        emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
    }

    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", handleContactSubmit);
    }
});
//==============================
//تابع ارسال پیام
//==============================
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

    const createdAt = new Date().toLocaleString("fa-IR");

    const payload = {
        name,
        email,
        subject,
        message,
        createdAt,
        isRead: false
    };

    try {
        sendBtn.disabled = true;
        sendBtn.textContent = "در حال ارسال...";

        // 1. ذخیره پیام در MockAPI
        await saveMessageToMockAPI(payload);

        // 2. ارسال ایمیل با EmailJS
        await sendMessageWithEmailJS(payload);

        statusEl.textContent = "پیام شما با موفقیت ارسال شد.";
        statusEl.className = "status success";

        event.target.reset();

    } catch (error) {
        console.error(error);

        statusEl.textContent = "خطا در ارسال پیام. لطفاً دوباره تلاش کنید.";
        statusEl.className = "status error";

    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "ارسال پیام";
    }
}
//================================



// =======================
//  ذخیره پیام در 
// MockAPI
// =======================

async function saveMessageToMockAPI(messageData) {
    const response = await fetch(`${CONFIG.MOCK_API_BASE}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(messageData)
    });

    if (!response.ok) {
        throw new Error("خطا در ذخیره پیام در MockAPI");
    }

    return await response.json();
}

//=================================
//ارسال ایمیل با EmailJS
//=================================
async function sendMessageWithEmailJS(messageData) {
    return await emailjs.send(
        CONFIG.EMAILJS_SERVICE_ID,
        CONFIG.EMAILJS_TEMPLATE_ID,
        {
            name: messageData.name,
            email: messageData.email,
            subject: messageData.subject,
            message: messageData.message,
            createdAt: messageData.createdAt
        }
    );
}

// fetch("https://6a231d705c610353286ab91f.mockapi.io/teacherAPI/messages", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//         name: "Ali",
//         email: "ali@test.com",
//         message: "سلام استاد",
//         date: "2026-06-05"
//     })
// })
// ==========================
// کد دریافت پیام‌ها برای Dashboard
// ==========================

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
});




async function loadDashboardMessages() {



    const messagesList = document.getElementById("messagesList");

    messagesList.innerHTML = "<p>در حال دریافت پیام‌ها...</p>";

    try {
        const response = await fetch(`${CONFIG.MOCK_API_BASE}/messages`);

        if (!response.ok) {
            throw new Error("خطا در دریافت پیام‌ها");
        }

        const messages = await response.json();

        if (messages.length === 0) {
            messagesList.innerHTML = "<p>هنوز پیامی ارسال نشده است.</p>";
            return;
        }

        messages.reverse();

        messagesList.innerHTML = messages.map(item => `
      <article class="message-card ${item.isRead ? "read" : "unread"}">
        <div class="message-header">
          <h3>${escapeHTML(item.subject)}</h3>
          <span id="date-span">${escapeHTML(item.createdAt || "")}</span>
        </div>

        <p><strong>نام:</strong> ${escapeHTML(item.name)}</p>
        <p><strong>ایمیل:</strong> ${escapeHTML(item.email)}</p>
        <p><strong>پیام:</strong></p>
        <p>${escapeHTML(item.message)}</p>

        <div class="message-actions">
          <button class="readbtn admin-msg-btn" onclick="markMessageAsRead('${item.id}')">خوانده شد</button>
          <button class="danger admin-msg-btn" onclick="deleteMessage('${item.id}')">حذف</button>
        </div>
      </article>
    `).join("");

    } catch (error) {
        console.error(error);
        messagesList.innerHTML = "<p class='status error'>خطا در دریافت پیام‌ها.</p>";
    }
}
// =================
// delete message
// =================
async function deleteMessage(id) {
    const confirmed = confirm("آیا از حذف این پیام مطمئن هستید؟");

    if (!confirmed) return;

    try {
        const response = await fetch(`${CONFIG.MOCK_API_BASE}/messages/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("خطا در حذف پیام");
        }

        loadDashboardMessages();

    } catch (error) {
        console.error(error);
        alert("حذف پیام با خطا مواجه شد.");
    }
}
// ===========================
// علامت‌زدن پیام به عنوان خوانده‌شده
// ===========================

async function markMessageAsRead(id) {
    try {
        const response = await fetch(`${CONFIG.MOCK_API_BASE}/messages/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                isRead: true
            })
        });

        if (!response.ok) {
            throw new Error("خطا در تغییر وضعیت پیام");
        }

        loadDashboardMessages();

    } catch (error) {
        console.error(error);
        alert("تغییر وضعیت پیام با خطا مواجه شد.");
    }
}

// ===========================
// جلوگیری ساده از XSS
// ===========================

function escapeHTML(value) {
    if (!value) return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ===========================




// ================================

// =======================
// AUTH
// =======================

// function checkAuth() {
//     return localStorage.getItem("isAdmin") === "true";
// }

// function login(username, password) {

//     // برای پروژه دانشگاهی لاگین ساده
//     if (username === "admin" && password === "1234") {
//         localStorage.setItem("isAdmin", "true");
//         renderDashboard();
//     } else {
//         alert("نام کاربری یا رمز اشتباه است");
//     }
// }

// function logout() {
//     localStorage.removeItem("isAdmin");
//     renderLogin();
// }
document.addEventListener("DOMContentLoaded", () => {

    const currentPage = window.location.pathname.split("/").pop();
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    // فقط داشبورد محافظت شود
    if (currentPage === "teacher-dashboard.html" && !isLoggedIn) {
        window.location.href = "./login.html";
    }

});


function handleLogin() {

    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error-msg");

    const ADMIN_USER = "admin";
    const ADMIN_PASS = "123456";

    if (user === ADMIN_USER && pass === ADMIN_PASS) {

        localStorage.setItem("isLoggedIn", "true");

        window.location.href = "./teacher-dashboard.html";

    } else {

        if (errorMsg) {
            errorMsg.innerText = "نام کاربری یا رمز اشتباه است";
        } else {
            alert("نام کاربری یا رمز اشتباه است");
        }

    }

}

function logout() {

    localStorage.removeItem("isLoggedIn");
    window.location.href = "./index.html";

}

// =======================
// LOGIN PAGE
// =======================

function renderLogin() {
    app.innerHTML = `
    <h2>ورود استاد</h2>
    <input id="username" placeholder="نام کاربری">
    <input id="password" type="password" placeholder="رمز عبور">
    <button onclick="handleLogin()">ورود</button>
  `;
}

function handleLogin() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    login(u, p);
}


// =======================
// DASHBOARD
// =======================

function renderDashboard() {
    app.innerHTML = `
    <h1>پنل مدیریت</h1>
    <button onclick="logout()">خروج</button>

    <h2>پیام‌های دانشجویان</h2>
    <div id="messages"></div>

    <h2>افزودن جزوه جدید</h2>
    <input id="noteTitle" placeholder="عنوان جزوه">
    <input id="noteLink" placeholder="لینک فایل">
    <textarea id="noteDesc" placeholder="توضیحات"></textarea>
    <button onclick="addNote()">افزودن</button>

    <h2>لیست جزوات</h2>
    <div id="notes"></div>
  `;

    loadMessages();
    loadNotes();
}


// =======================
// MESSAGES CRUD
// =======================

async function loadMessages() {

    const res = await fetch(`${MOCK_API_BASE}/messages`);
    const data = await res.json();

    const container = document.getElementById("messages");
    container.innerHTML = "";

    data.reverse().forEach(msg => {
        container.innerHTML += `
      <div class="card">
        <p><b>${msg.name}</b> (${msg.email})</p>
        <p>${msg.message}</p>
        <button onclick="deleteMessage('${msg.id}')">حذف</button>
      </div>
    `;
    });
}

async function deleteMessage(id) {
    await fetch(`${MOCK_API_BASE}/messages/${id}`, {
        method: "DELETE"
    });

    loadMessages();
}


// =======================
// NOTES CRUD
// =======================

async function loadNotes() {

    const res = await fetch(`${MOCK_API_BASE}/notes`);
    const data = await res.json();

    const container = document.getElementById("notes");
    container.innerHTML = "";

    data.forEach(note => {
        container.innerHTML += `
      <div class="card">
        <h3>${note.title}</h3>
        <p>${note.description}</p>
        <a href="${note.link}" target="_blank">دانلود</a>
        <button onclick="deleteNote('${note.id}')">حذف</button>
      </div>
    `;
    });
}

async function addNote() {

    const title = document.getElementById("noteTitle").value;
    const link = document.getElementById("noteLink").value;
    const description = document.getElementById("noteDesc").value;

    await fetch(`${MOCK_API_BASE}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            link,
            description
        })
    });

    loadNotes();
}

async function deleteNote(id) {
    await fetch(`${MOCK_API_BASE}/notes/${id}`, {
        method: "DELETE"
    });

    loadNotes();
}


// =======================
// INIT
// =======================

// if (checkAuth()) {
//     renderDashboard();
// } else {
//     renderLogin();
// }
//====================
//login
//====================
document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.querySelector('.login-icon');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true' && loginLink) {
        loginLink.href = 'teacher-dashboard.html';
        loginLink.innerHTML = '<i class="fas fa-chart-line"></i> <span>پنل مدیریت</span>';

        // اضافه کردن دکمه خروج (اختیاری)
        const logoutBtn = document.createElement('a');
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
        logoutBtn.className = 'login-icon';
        logoutBtn.style.marginRight = '10px';
        logoutBtn.onclick = () => {
            localStorage.removeItem('isLoggedIn');
            location.reload();
        };
        loginLink.parentNode.appendChild(logoutBtn);
    }
});

function handleLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('error-msg');

    // --- بخش کنایه‌آمیز ماجرا: رمز عبور ---
    // حتماً این مقادیر را تغییر بده تا امنیت پوشالی‌مان کمی محکم‌تر شود
    const ADMIN_USER = "admin";
    const ADMIN_PASS = "123456";

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        // ذخیره وضعیت ورود در حافظه مرورگر
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('lastLogin', new Date().toLocaleString('fa-IR'));

        // هدایت به داشبورد
        window.location.href = "teacher-dashboard.html";
    } else {
        errorMsg.innerText = "تلاش بیهوده نکن! اطلاعات اشتباه است.";
        // یک لرزش کوچک برای افکت بیشتر
        const card = document.querySelector('.login-card');
        card.style.animation = "shake 0.5s";
        setTimeout(() => card.style.animation = "", 500);
    }
}

// ورود با زدن دکمه اینتر
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleLogin();
    }
});
//===========================لاگین=====
// document.addEventListener('DOMContentLoaded', () => {
//     const currentPage = window.location.pathname.split('/').pop();
//     const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

//     updateAuthLink(isLoggedIn);

//     // اگر کاربر وارد نشده و مستقیم وارد داشبورد شد، برگردد به لاگین
//     if (currentPage === 'teacher-dashboard.html' && !isLoggedIn) {
//         window.location.href = './login.html';
//         return;
//     }

//     // اگر کاربر قبلاً لاگین کرده و دوباره صفحه لاگین را باز کرد، برود داشبورد
//     if (currentPage === 'login.html' && isLoggedIn) {
//         window.location.href = './teacher-dashboard.html';
//         return;
//     }
// });

// function updateAuthLink(isLoggedIn) {
//     const authLink = document.getElementById('authLink');

//     if (!authLink) return;

//     if (isLoggedIn) {
//         authLink.href = './teacher-dashboard.html';
//         authLink.title = 'ورود به پنل استاد';
//         authLink.innerHTML = `
//             <i class="fas fa-user-crown"></i>
//             <span>پنل استاد</span>
//         `;
//     } else {
//         authLink.href = './login.html';
//         authLink.title = 'ورود مدیریت';
//         authLink.innerHTML = `
//             <i class="fas fa-user-shield"></i>
//             <span>ورود استاد</span>
//         `;
//     }
// }

// function handleLogin() {
//     const usernameInput = document.getElementById('username');
//     const passwordInput = document.getElementById('password');
//     const errorMsg = document.getElementById('error-msg');

//     if (!usernameInput || !passwordInput) return;

//     const username = usernameInput.value.trim();
//     const password = passwordInput.value.trim();

//     // اطلاعات ورود تستی
//     const validUsername = 'admin';
//     const validPassword = '1234';

//     if (username === validUsername && password === validPassword) {
//         localStorage.setItem('isLoggedIn', 'true');
//         window.location.href = './teacher-dashboard.html';
//     } else {
//         if (errorMsg) {
//             errorMsg.textContent = 'نام کاربری یا رمز عبور اشتباه است';
//             errorMsg.style.color = 'red';
//         } else {
//             alert('نام کاربری یا رمز عبور اشتباه است');
//         }
//     }
// }

// function logout() {
//     localStorage.removeItem('isLoggedIn');
//     window.location.href = './index.html';
// }


/////////////////////////////////////////////
////////داشبورد درس
///درس ها رو لود میکنه
document.addEventListener("DOMContentLoaded", () => {

    const courseContainer = document.getElementById("courses-list");

    if (courseContainer) {
        loadCourses();
    }

});

//درس ها رو میگیره و نشون میده
async function loadCourses() {

    const container = document.getElementById("courses-list");

    try {

        const res = await fetch(`${CONFIG.MOCK_API_BASE}/notes`);
        const courses = await res.json();

        container.innerHTML = "";

        courses.forEach(course => {

            container.innerHTML += `
            
            <div class="courses-desc-box">

                <h2 class="courses-desc-box-heading">
                    ${course.title}
                </h2>

                <p class="courses-desc-box-item">
                    ${course.description}
                </p>

                <div class="script-btn">
                    <a href="${course.link}"
                    class="contents-list-item-readmore-btn btn-style btn-vacant-style"
                    target="_blank" download>
                    دانلود فایل
                    </a>
                </div>

            </div>

            `;

        });

    } catch (error) {

        container.innerHTML = "خطا در دریافت دروس";

    }

}

// =====================
// لود شدن درسها در داشبورد
document.addEventListener("DOMContentLoaded", () => {

    const dashContainer = document.getElementById("dashboard-courses-list");

    if (dashContainer) {
        loadDashboardCourses();
    }

});
////======================
///چاپ درسها در داشبورد
async function loadDashboardCourses() {

    // const container = document.getElementById("dashboard-courses-list");

    // const res = await fetch(`${CONFIG.MOCK_API_BASE}/notes`);
    // const courses = await res.json();

    // container.innerHTML = "<h3>لیست دروس ثبت شده:</h3><br>";

    // courses.forEach(course => {

    //     container.innerHTML += `

    //     <div style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:8px">

    //         <strong>${course.title}</strong>
    //         <p>${course.description}</p>

    //         <button onclick="deleteCourse('${course.id}')" 
    //         style="background:#c0392b; color:white; border:none; padding:6px 12px; border-radius:6px">
    //         حذف
    //         </button>

    //     </div>

    //     `;

    // });
    const container = document.getElementById("dashboard-courses-list");

    const res = await fetch(`${CONFIG.MOCK_API_BASE}/notes`);
    const courses = await res.json();

    container.innerHTML = "<h3>لیست دروس ثبت شده:</h3><br>";

    courses.forEach(course => {

        container.innerHTML += `
        
        <div style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:8px">

            <strong>${course.title}</strong>
            <p>${course.description}</p>

            <a href="${course.link}"
               class="contents-list-item-readmore-btn btn-style btn-vacant-style"
               target="_blank" downlaod>
               مشاهده / دانلود فایل
            </a>

            <br><br>

            <button onclick="deleteCourse('${course.id}')" 
            style="background:#c0392b; color:white; border:none; padding:6px 12px; border-radius:6px">
            حذف
            </button>

        </div>

        `;

    });
}


////امنیت 
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop();
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (currentPage === "teacher-dashboard.html" && !isLoggedIn) {
        window.location.href = "./login.html";
    }
});
;

////////////////////////////////////////
///اضافه کردن فایل
async function addNewCourse() {
    const titleEl = document.getElementById("courseTitle");
    const descEl = document.getElementById("courseDescription");
    const fileEl = document.getElementById("courseFile");

    const title = titleEl.value.trim();
    const description = descEl.value.trim();
    const file = fileEl.files[0];

    if (!title || !description || !file) {
        alert("لطفاً نام درس، توضیحات و فایل PDF را کامل کنید.");
        return;
    }

    if (file.type !== "application/pdf") {
        alert("فقط فایل PDF مجاز است.");
        return;
    }

    try {
        // 1) آپلود فایل در Cloudinary
        const cloudinaryUrl = await uploadFileToCloudinary(file);
        console.log("PDF URL:", cloudinaryUrl);


        // 2) ذخیره اطلاعات درس در MockAPI
        const newCourse = {
            title,
            description,
            link: cloudinaryUrl,
            createdAt: new Date().toLocaleString("fa-IR")
        };

        const response = await fetch(`${CONFIG.MOCK_API_BASE}/notes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newCourse)
        });

        if (!response.ok) {
            throw new Error("خطا در ذخیره درس");
        }

        // 3) پاک‌کردن فرم
        titleEl.value = "";
        descEl.value = "";
        fileEl.value = "";

        alert("جزوه با موفقیت اضافه شد.");

        // 4) رفرش لیست‌ها
        if (typeof loadDashboardCourses === "function") {
            loadDashboardCourses();
        }

        if (typeof loadCourses === "function") {
            loadCourses();
        }

    } catch (error) {
        console.error(error);
        alert("خطا در افزودن جزوه. دوباره تلاش کنید.");
    }
}


async function uploadFileToCloudinary(file) {

    const cloudName = "dm16lrlci";
    const uploadPreset = "behkish_upload";


    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    // اینجا از محتوای پاسخ رمزگشایی می‌کنیم
    const result = await response.json();

    if (!response.ok) {
        // این همان جایی است که می‌فهمیم چرا ما را راه نمی‌دهد
        console.error("متن دقیق خطای Cloudinary:", result);
        throw new Error(`خطای ${response.status}: ${result.error.message}`);
    }

    return result.secure_url;

    // const formData = new FormData();
    // formData.append("file", file);
    // formData.append("upload_preset", uploadPreset);

    // const response = await fetch(
    //     `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
    //     {
    //         method: "POST",
    //         body: formData
    //     }
    // );
    // if (!response.ok) {
    //     const errorDetails = await response.json();
    //     console.error("خطای Cloudinary:", errorDetails); // اینجا متن دقیق خطا را می‌بینید
    //     throw new Error("آپلود ناموفق: " + errorDetails.error.message);
    // }

    // const data = await response.json();

    // if (!response.ok) {
    //     console.error("Cloudinary error:", data);
    //     throw new Error(data.error?.message || "خطا در آپلود فایل");
    // }

    // return data.secure_url;
}
// تابع حذف درس از MockAPI و لیست
async function deleteCourse(id) {
    // یک تاییدیه کوچک که کاربر اشتباهی دستش روی دکمه نرود
    if (!confirm("آیا از حذف این جزوه اطمینان دارید؟")) {
        return;
    }

    try {
        const response = await fetch(`${CONFIG.MOCK_API_BASE}/notes/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("خطا در حذف درس از سرور");
        }

        alert("جزوه با موفقیت حذف شد.");

        // بعد از حذف موفق، لیست را دوباره بارگذاری کن تا تغییرات دیده شود
        if (typeof loadDashboardCourses === "function") {
            loadDashboardCourses();
        }

    } catch (error) {
        console.error("Delete Error:", error);
        alert("مشکلی در حذف جزوه پیش آمد.");
    }
}

// لودر    
window.onload = () => {
    setTimeout(() => {
        document.querySelector('.neon-loader').style.display = 'none';
        //  console.log("خب، صفحه لود شد.");
    }, 5000);
};
window.addEventListener("load", function () {
    document.getElementById("overlay").style.display = "none";
});
