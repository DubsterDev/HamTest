function migrateDb() {
    const dbVersion = parseInt(localStorage.getItem("db-version") ?? "4");
    const classes = ["technician", "general", "extra"]

    if (dbVersion === 4) {
        // Upgrade to 5
        classes.forEach(licenseClass => {
            const pool = JSON.parse(localStorage.getItem(`${licenseClass}-pool`) ?? "{}");
            const newPool = {};

            Object.keys(pool).forEach(key => {
                const question = pool[key];
                question["lastSeenAt"] = 0;
                newPool[key] = question;
            });

            localStorage.setItem(`${licenseClass}-pool`, JSON.stringify(newPool));
        });

        localStorage.setItem("db-version", 5)
    }

    // Run again in case there are more updates
    migrateDb();
}

migrateDb();