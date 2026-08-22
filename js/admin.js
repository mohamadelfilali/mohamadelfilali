// =========================================================
// محمد الفيلالي — Admin Dashboard Interface
// =========================================================

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // ضع رابط Google Apps Script الخاص بك هنا
    const API_URL = "https://script.google.com/macros/s/AKfycbwPCifLt5hKPMWvruF8aXiD5xAlIWXuN6u3C4tEgPJO6cs1ZnNK3QZFf7znmbP2mV9l/exec";

    const loginSection = document.getElementById("login-section");
    const dashboardSection = document.getElementById("dashboard-section");
    const loginForm = document.getElementById("admin-login-form");
    const loginStatus = document.getElementById("login-status");
    const logoutBtn = document.getElementById("logout-btn");

    let authCredentials = null;

    // -----------------------------------------------------
    // LOGIN
    // -----------------------------------------------------
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("admin-email").value.trim();
            const password = document.getElementById("admin-password").value.trim();

            loginStatus.textContent = "جاري التحقق...";
            loginStatus.className = "form-status";

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                        action: "adminLogin",
                        email: email,
                        password: password
                    })
                });

                const result = await response.json();

                if (result.success) {
                    authCredentials = { email, password };
                    loginSection.hidden = true;
                    dashboardSection.hidden = false;
                    loadDashboardData();
                } else {
                    loginStatus.textContent = result.message || "فشل تسجيل الدخول.";
                    loginStatus.className = "form-status error";
                }
            } catch (err) {
                console.error(err);
                loginStatus.textContent = "حدث خطأ أثناء الاتصال بالسيرفر.";
                loginStatus.className = "form-status error";
            }
        });
    }

    // LOGOUT
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            authCredentials = null;
            dashboardSection.hidden = true;
            loginSection.hidden = false;
        });
    }

    // -----------------------------------------------------
    // TABS NAVIGATION
    // -----------------------------------------------------
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.hidden = true);

            btn.classList.add("active");
            document.getElementById(btn.dataset.tab).hidden = false;
        });
    });

    // -----------------------------------------------------
    // LOAD DASHBOARD DATA
    // -----------------------------------------------------
    async function loadDashboardData() {
        fetchMessages();
        fetchProjects();
    }

    // FETCH MESSAGES
    async function fetchMessages() {
        const container = document.getElementById("messages-list-container");
        try {
            const res = await fetch(`${API_URL}?action=getMessages&email=${encodeURIComponent(authCredentials.email)}&password=${encodeURIComponent(authCredentials.password)}`);
            const data = await res.json();

            if (data.success && data.messages.length > 0) {
                let html = `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>نوع الخدمة</th>
                                <th>التواصل</th>
                                <th>الرسالة</th>
                                <th>التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                data.messages.forEach(msg => {
                    html += `
                        <tr>
                            <td>${escapeHtml(msg.name)}</td>
                            <td>${escapeHtml(msg.service)}</td>
                            <td>${escapeHtml(msg.contactMethod)}: ${escapeHtml(msg.contactValue)}</td>
                            <td>${escapeHtml(msg.message)}</td>
                            <td>${new Date(msg.submittedAt).toLocaleDateString("ar-EG")}</td>
                        </tr>
                    `;
                });
                html += `</tbody></table>`;
                container.innerHTML = html;
            } else {
                container.innerHTML = `<p style="color: var(--text-muted);">لا توجد رسائل حالياً.</p>`;
            }
        } catch (e) {
            container.innerHTML = `<p style="color: var(--danger);">تعذر تحميل الرسائل.</p>`;
        }
    }

    // FETCH PROJECTS
    async function fetchProjects() {
        const container = document.getElementById("admin-projects-list");
        try {
            const res = await fetch(`${API_URL}?action=getProjects`);
            const data = await res.json();

            if (data.success && data.projects.length > 0) {
                let html = `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>العنوان</th>
                                <th>الوصف</th>
                                <th>الرابط</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                data.projects.forEach(p => {
                    html += `
                        <tr>
                            <td>${escapeHtml(p.title)}</td>
                            <td>${escapeHtml(p.description)}</td>
                            <td><a href="${escapeHtml(p.url)}" target="_blank" style="color: var(--text);">معاينة ↗</a></td>
                        </tr>
                    `;
                });
                html += `</tbody></table>`;
                container.innerHTML = html;
            } else {
                container.innerHTML = `<p style="color: var(--text-muted);">لا توجد مشاريع مضافة.</p>`;
            }
        } catch (e) {
            container.innerHTML = `<p style="color: var(--danger);">تعذر تحميل المشاريع.</p>`;
        }
    }

    // ADD PROJECT
    const addProjectForm = document.getElementById("add-project-form");
    if (addProjectForm) {
        addProjectForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const status = document.getElementById("project-status");
            status.textContent = "جاري الحفظ...";

            const payload = {
                action: "addProject",
                email: authCredentials.email,
                password: authCredentials.password,
                title: document.getElementById("project-title").value.trim(),
                description: document.getElementById("project-description").value.trim(),
                imageUrl: document.getElementById("project-image").value.trim(),
                url: document.getElementById("project-url").value.trim()
            };

            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();

                if (result.success) {
                    status.textContent = "تمت إضافة المشروع بنجاح!";
                    status.className = "form-status success";
                    addProjectForm.reset();
                    fetchProjects();
                } else {
                    status.textContent = result.message || "حدث خطأ.";
                    status.className = "form-status error";
                }
            } catch (err) {
                status.textContent = "تعذر الإتصال بالسيرفر.";
                status.className = "form-status error";
            }
        });
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
});
