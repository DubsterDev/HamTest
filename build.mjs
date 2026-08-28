import { readFile, writeFile, rm, mkdir, cp } from "node:fs/promises";

// Empty the build directory
await rm("build/", { recursive: true, force: true });
await mkdir("build/");

// Read header, footer
const header = await readFile("app/header.html", {encoding: "utf-8"});
const footer = await readFile("app/footer.html", {encoding: "utf-8"});

// Copy assets, Google search verification file
await cp("app/assets", "build/assets", { recursive: true });
await cp("app/google_verification.html", "build/google_verification.html", { recursive: true });

// Copy 404, index, settings
await copyFile("app/index.html", "build/index.html");
await copyFile("app/404.html", "build/404.html");
await copyFile("app/settings.html", "build/settings.html");

const classNames = ["Technician", "General", "Extra"];

// Make practice, study folders
await mkdir("build/practice");
await mkdir("build/study");

// Copy practice, study
const practiceTemplate = await readFile("app/practice.html", {encoding: "utf-8"});
const studyTemplate = await readFile("app/study.html", {encoding: "utf-8"});
classNames.forEach(async className => {
    const lowerClassName = className.toLowerCase();
    const replacements = {
        "upper_class": className,
        "lower_class": lowerClassName
    };

    await copyFile("app/practice.html", `build/practice/${lowerClassName}.html`, replacements);
    await copyFile("app/study.html", `build/study/${lowerClassName}.html`, replacements);
})

async function copyFile(src, dest, customReplace={}) {
    const template = await readFile(src, {encoding: "utf-8"});
    const splitAtMetadata = template.split(":endmetadata-->");

    const metadata = JSON.parse(splitAtMetadata[0].replace("<!--metadata:", "").trim());

    let extraCss = "";
    if ("css" in metadata) {
        metadata["css"].forEach(stylesheet => {
            extraCss += `<link rel="stylesheet" href="/assets/styles/${stylesheet}.css">\n`
        })
    }
    const newHeader = header
        .replaceAll("{{title}}", metadata["title"])
        .replaceAll("{{extra_css}}", extraCss)

    
    let processedTemplate = splitAtMetadata[1].replaceAll("{{header}}", newHeader).replaceAll("{{footer}}", footer);

    Object.keys(customReplace).forEach(key => {
        processedTemplate = processedTemplate.replaceAll(`{{${key}}}`, customReplace[key]);
    })

    await writeFile(dest, processedTemplate);
}