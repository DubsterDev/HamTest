const settings = JSON.parse(localStorage.getItem("settings") ?? "{}");

Object.keys(settings).forEach(setting => {
    document.getElementById(setting).checked = settings[setting];
})

document.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
    checkbox.addEventListener("change", () => {
        settings[checkbox.id] = checkbox.checked;
        localStorage.setItem("settings", JSON.stringify(settings))
    })
})