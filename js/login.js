document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("formLogin");

    if (!formLogin) return;

    formLogin.addEventListener("submit", fazerLogin);
});

function fazerLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
        alert("Preencha e-mail e senha.");
        return;
    }

    localStorage.setItem("pousada_logado", "true");

    window.location.href = "dashboard.html";
}