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
        /*details = details.replace(/\$currentUrl/g,'_currentUrl');
details = details.replace(/\elif/g,'elseif');
        details = details.replace(/ set /g,' assign ');
        details = details.replace(/replace\((.*?),\s*(.*?)\)/g, "replace: $1, $2")
                details = details.replace(/replace \((.*?),\s*(.*?)\)/g, "replace: $1, $2")
*/
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
        var csv = parseCSV(file);
        var totalTemplates = 0;
        csv.forEach(datum => {
                var data = {
                    $currentUrl: "https://example.com",
                    _currentUrl: "https://example.com",
                    "description": "A wbesite description",
                    "title": "A website title",
                    "h1": "A nice header",
                    "canonical": "https://example.Com/canonical"
                };
                try {
                    var conf = datum.details;
                    var acts = conf.actions;
                    acts.forEach(act => {
                            var template = act.transformationConfig.template;
                            totalTemplates++
                            try {
                                checkLiquid(datum.website_id, datum.id, template, data);
                                successLiquid++
                            } catch (e) {
                                if (e.message.includes("$currentUrl")) {
                                    failCurrentUrl++;
                                } else if (e.message.includes("tag \"elif\"")) {
                                    failElif++;
                                } else if (e.message.includes("tag \"set\"")) {
                                    console.log(chalk.green(template));
                                    failSet++;
                                } else if (e.message.includes("expected \":\" after filter name")) {
                                    failFilter++;
                                    console.warn("LIQUID ERROR", e, template);
                                } else {
                                    failedOther++;
                                    console.warn("LIQUID ERROR", e, template);
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

        console.log(chalk.bgYellow("                    "));
        console.log("RESULTS")
        console.log(chalk.bgYellow("                    "));
        console.log("TOTAL TEMPLATES: ", totalTemplates);
        console.log(chalk.bgYellow("                    "));
        console.log(chalk.cyan("NUNJUCKS"));
        console.log("FAILED: ", failNunjucks);
        console.log("SUCCESS: ", successNunjucks);
        console.log(chalk.bgYellow("                    "));
        console.log(chalk.blue("LIQUID"));
        console.log("SUCCESS: ", successLiquid);
        console.log("FAILED TOTAL:", failLiquid);
        console.log("FAILED because of currentUrl", failCurrentUrl);
        console.log("FAILED because of elif", failElif);
        console.log("FAILED because of set", failSet);
        console.log("FAILED because of filter", failFilter);
        console.log("FAILED because of other", failedOther);
        console.log(chalk.bgYellow("                    "));
        console.log(chalk.red("FAILED UNKNOWN REASON"), a);
        console.log(chalk.bgYellow("                    "));
        // console.log(chalk.gray("INFO"));
        // console.log(results)
    }
);
