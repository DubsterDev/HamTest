import { readFile, writeFile, rm, mkdir, cp } from "node:fs/promises";

// Empty the build directory
await rm("build/", { recursive: true, force: true });
await mkdir("build/");

// Copy assets
await cp("app/assets", "build/assets", { recursive: true });

// Copy 404, index
await cp("app/index.html", "build/index.html");
await cp("app/404.html", "build/404.html");

const classNames = ["Technician", "General", "Extra"];

// Make practice, study folders
await mkdir("build/practice");
await mkdir("build/study");

// Copy practice, study
const practiceTemplate = await readFile("app/practice.html", {encoding: "utf-8"});
const studyTemplate = await readFile("app/study.html", {encoding: "utf-8"});
classNames.forEach(async className => {
    const lowerClassName = className.toLowerCase();
    
    const practiceTemplateFilled = practiceTemplate
        .replaceAll("{{upper_class}}", className)
        .replaceAll("{{lower_class}}", lowerClassName);
    const studyTemplateFilled = studyTemplate
        .replaceAll("{{upper_class}}", className)
        .replaceAll("{{lower_class}}", lowerClassName);
    await writeFile(`build/practice/${lowerClassName}.html`, practiceTemplateFilled);
    await writeFile(`build/study/${lowerClassName}.html`, studyTemplateFilled);
})