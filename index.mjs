import { Liquid } from "liquidjs";
import nunjucks from 'nunjucks';
import fs from "fs";
import chalk from 'chalk';

nunjucks.configure({ autoescape: true });

function checkLiquid(moduleId, websiteId, template, data) {
    const engine = new Liquid();
    return engine.parseAndRenderSync(template, data);
}

function checkNunjucks(template, data) {
    return nunjucks.renderString(template, data);
}

function replaceFirstAndLast(str, firstChar, lastChar) {
    if (str.length <= 1) {
        return str;
        // Not enough characters to replace both
    }
    return firstChar + str.slice(1, -1) + lastChar;
}

function convertTemplate(template) {
    let convertedTemplate = template
    convertedTemplate = template.replace(/""/g, '"');

    // Fix currentUrl variable
    convertedTemplate = convertedTemplate.replace(/\$currentUrl/g,'_currentUrl');

    // Fix elif statement
    convertedTemplate = convertedTemplate.replace(/\elif/g,'elseif');

    // Fix set statement
    convertedTemplate = convertedTemplate.replace(/ set /g,' assign ');

    // Fix replace filter
    convertedTemplate = convertedTemplate.replace(/replace\((.*?),\s*(.*?)\)/g, "replace: $1, $2")

    // Fix truncate filter
    convertedTemplate = convertedTemplate.replace(/truncate\((\d+)\)/g, "truncate: $1");

    // Fix length => size
    convertedTemplate = convertedTemplate.replace(/\|length/g, "|size");

    // Fix trim
    convertedTemplate = convertedTemplate.replace(/\|trim/g, "|strip");

    return convertedTemplate
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

        // Add the first four fields to the object
        for (let j = 0; j < 5; j++) {
            obj[headers[j].trim()] = currentLine[j] ? currentLine[j].trim() : null;
        }

        // extract config column into details
        let details = currentLine[5]
        details = details.replace(/""/g, '"');
        obj.details = details.trim();
        obj.details = replaceFirstAndLast(obj.details, "", "");

        // Try to parse the 'details' field as JSON if it looks like JSON
        try {
            obj.details = JSON.parse(obj.details);
        } catch (error) {
            // If parsing fails, keep it as a string
            console.log(chalk.bgRed('Details field is not valid JSON:', obj.details));
        }

        result.push(obj);
    }

    return result;
}


// Path to your .csv file
const filePath = 'modules/modules_with_templates.csv';

// Read the file asynchronously
fs.readFile(filePath, 'utf8', (err, file) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        var a = 0;
        var results = {

        };
        var failLiquid = 0;
        var failCurrentUrl = 0;
        var failElif = 0;
        var failSet = 0;
        var failedOther = 0;
        var failFilter = 0;
        var failNunjucks = 0;
        var successNunjucks = 0;
        var successLiquid = 0;
        var failTruncate = 0;
        var failReplace = 0;
        var failTrim = 0;
        var failLength = 0;
        var csv = parseCSV(file);
        var totalTemplates = 0;
        csv.forEach(datum => {
                var data = {
                    $currentUrl: "https://example.com",
                    _currentUrl: "https://example.com",
                    "description": "A wbesite description",
                    "title": "A website title",
                    "h1": "A nice header",
                    "canonical": "https://example.Com/canonical",
                    "metadesc": "test"
                };
                try {
                    var conf = datum.details;
                    var acts = conf.actions;
                    acts.forEach(act => {
                            var template = act.transformationConfig.template;
                            totalTemplates++
                            const convertedTemplate = convertTemplate(template)
                            try {
                                checkLiquid(datum.website_id, datum.id, convertedTemplate, data);
                                successLiquid++
                            } catch (e) {
                                if (e.message.includes("$currentUrl")) {
                                    failCurrentUrl++;
                                } else if (e.message.includes("tag \"elif\"")) {
                                    console.warn("LIQUID LIQUID ERROR", e, convertedTemplate);
                                    failElif++;
                                } else if (e.message.includes("tag \"set\"")) {
                                    console.warn("LIQUID SET ERROR", e, convertedTemplate);
                                    failSet++;
                                } else if (e.message.includes("expected \":\" after filter name")) {
                                    failFilter++;

                                    if (convertedTemplate.includes("replace")) {
                                        failReplace++;
                                    }

                                    if (convertedTemplate.includes("truncate")) {
                                        failTruncate++;
                                    }

                                    if (convertedTemplate.includes("trim")) {
                                        failTrim++;
                                    }

                                    if (convertedTemplate.includes("|length") || convertedTemplate.includes("| length")) {
                                        failLength++;
                                    }

                                    console.warn("LIQUID FILTER ERROR", e, convertedTemplate);
                                } else {
                                    failedOther++;
                                    // console.warn("LIQUID ERROR", e, template);
                                }
                                failLiquid++;
                                results[datum.website_id] = results[datum.website_id] ?? {total:0};
                                results[datum.website_id][datum.module_id] = results[datum.website_id][datum.module_id] ?? {total: 0};

                                results[datum.website_id].total ++;
                                results[datum.website_id][datum.module_id].total ++;
                            }

                            // Test Nunjucks template
                            try {
                                checkNunjucks(template, data);
                                successNunjucks++
                            } catch (e) {
                                failNunjucks++;
                            }
                        }
                    )
                } catch (e) {
                    a++;
                }
            }
        );

        console.log(chalk.bgWhiteBright("                    "));
        console.log("RESULTS")
        console.log(chalk.bgWhiteBright("                    "));
        console.log("TOTAL TEMPLATES: ", totalTemplates);
        console.log(chalk.bgWhiteBright("                    "));
        console.log(chalk.cyan("NUNJUCKS"));
        console.log("FAILED: ", failNunjucks);
        console.log("SUCCESS: ", successNunjucks);
        console.log(chalk.bgWhiteBright("                    "));
        console.log(chalk.blue("LIQUID"));
        console.log("SUCCESS: ", successLiquid);
        console.log("FAILED TOTAL:", failLiquid);
        console.log("FAILED because of currentUrl", failCurrentUrl);
        console.log("FAILED because of elif", failElif);
        console.log("FAILED because of set", failSet);
        console.log("FAILED because of filter", failFilter);
        console.log("FAILED because of truncate filter: ", failTruncate);
        console.log("FAILED because of replace filter: ", failReplace);
        console.log("FAILED because of trim filter: ", failTrim);
        console.log("FAILED because of length filter: ", failLength);
        console.log("FAILED because of other", failedOther);
        console.log(chalk.bgWhiteBright("                    "));
        console.log(chalk.red("FAILED UNKNOWN REASON"), a);
        console.log(chalk.bgWhiteBright("                    "));
        // console.log(chalk.gray("INFO"));
        // console.log(results)
    }
);
