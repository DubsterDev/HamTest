function loadSettings() {
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
}

const licenseClasses = ["technician", "general", "extra"];

document.getElementById("exportProgressButton").addEventListener("click", () => {
    const settings = JSON.parse(localStorage.getItem("settings") ?? "{}");
    const dbVersion = parseInt(localStorage.getItem("db-version"));
    const data = {
        dbVersion,
        settings
    };

    licenseClasses.forEach(licenseClass => {
        const progress = JSON.parse(localStorage.getItem(`${licenseClass}-pool`) ?? "{}");
        data[licenseClass] = progress;
    })

    const url = `data:application/json,${encodeURIComponent(JSON.stringify(data))}`;

    const date = new Date();

    const dateString = date.getMonth().toString().padStart(2, "0") + date.getDate().toString().padStart(2, "0") + date.getFullYear().toString().padStart(4, "0")

    const a = document.createElement("a");
    a.href = url;
    a.download = `progress${dateString}.hamtest`;
    a.click()
});

function importData(data) {
    const settings = data["settings"];
    localStorage.setItem("settings", JSON.stringify(settings));

    licenseClasses.forEach(licenseClass => {
        localStorage.setItem(`${licenseClass}-pool`, JSON.stringify(data[licenseClass]));
    });

    localStorage.setItem("db-version", data["dbVersion"]);

    // Migrate db in case its an old file
    migrateDb();

    loadSettings();
}

document.getElementById("importProgressButton").addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".hamtest";

    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const textContent = await file.text();
          const data = JSON.parse(textContent);
          importData(data)
        } catch (error) {
          console.error('Error reading file:', error);
        }
      }
    });

    fileInput.click();
});

loadSettings();