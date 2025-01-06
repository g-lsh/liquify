import { Liquid } from "liquidjs";
import nunjucks from 'nunjucks';
import fs from "fs";
import chalk from 'chalk';

nunjucks.configure({ autoescape: true });

function checkLiquid(moduleId, websiteId, template, data) {
    const engine = new Liquid();

// Define the 'match' filter
    engine.registerFilter('match', (input, patternWithFlags) => {
        // Extract the pattern and flags (if present)
        const regexPattern = patternWithFlags.replace(/\\+"/g, '"');  // Unescape quotes
        const flags = regexPattern.match(/\/([a-z]*)$/);

        // Create a regex object from the string
        const regex = new RegExp(regexPattern.replace(/\/[a-z]*$/, ''), flags ? flags[1] : '');  // Get regex and flags

        return input.match(regex);  // Matches and returns the array of matches or null
    });

    // Define the 'test' filter
    engine.registerFilter('test', (input, patternWithFlags) => {
        // Extract the pattern and flags (if present)
        const regexPattern = patternWithFlags.replace(/\\+"/g, '"');  // Unescape quotes
        const flags = regexPattern.match(/\/([a-z]*)$/);

        // Create a regex object from the string
        const regex = new RegExp(regexPattern.replace(/\/[a-z]*$/, ''), flags ? flags[1] : '');  // Get regex and flags

        return regex.test(input);  // Returns true or false
    });

    return engine.parseAndRenderSync(template, data)
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
    convertedTemplate = convertedTemplate.replace(/\elif/g,'elsif');

    // Fix set statement
    convertedTemplate = convertedTemplate.replace(/ set /g,' assign ');

    // Fix replace filter
    convertedTemplate = convertedTemplate.replace(/replace\s*\((.*?),\s*(.*?)\)/g, "replace: $1, $2");

    // Fix truncate filter
    convertedTemplate = convertedTemplate.replace(/truncate\s*\(\s*(\d+)\s*\)/g, "truncate: $1");

    // Fix length => size
    convertedTemplate = convertedTemplate.replace(/\|length/g, "|size");

    // Fix trim
    convertedTemplate = convertedTemplate.replace(/\|trim/g, "|strip");


    // Transform regex patterns (r/.../flags) into strings
    // (This fixes about 25/81 regexes)
    convertedTemplate = convertedTemplate.replace(/r\/(.*?)\/([a-z]*)/g, (_, pattern, flags) => {
        // Escape special characters and double quotes inside the pattern
        const escapedPattern = pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

        // If there are flags, we add them to the string as a part of the pattern
        const patternWithFlags = `"${escapedPattern}"`;  // Only pattern as a string

        return patternWithFlags;  // Return the transformed string without flags
    });

    // Replace .match(regex) with | match: regex
    convertedTemplate = convertedTemplate.replace(/\.match\((.*?)\)/g, '| match: $1');

    // Replace .test(regex) with | test: regex
    convertedTemplate = convertedTemplate.replace(/\.test\((.*?)\)/g, '| test: $1');

    convertedTemplate = convertedTemplate.replace(/\.slice\(-1\)\[0]/g, '.last')

    // Change "in" operator
    convertedTemplate = convertedTemplate.replace(/(['"].*?['"])\s+in\s+([\w|.\s]+)/g, "$2 contains $1");

    // Change "not in" operator
    convertedTemplate = convertedTemplate.replace(/(['"].*?['"])\s+not\s+in\s+([\w|.\s]+)/g, "$2 not contains $1");

    /**
     * We also have many other small issues:
     *
     * - String methods don't exist mainly in liquid: no splice/slice/endsWith etc...
     * - Liquid doesn't do on the fly logical operator evaluation in an if statement for instance, you'll have to assign the result first
     * - Liquid doesn't accept complex regEx with flags and doesn't use regEx r/ syntax
     * - Can only do simple logical operators combination
     * - String concatenatino doesn't work in liquid (string + string)
     * - mathematical operations are not possible, must be done thru explicit filters
      */


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
        var failRegex = 0;
        var failSlice = 0;
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
                                } else if (template.includes(".test(") || template.includes(".match(")) {
                                    failRegex++;
                                    console.warn("LIQUID FILTER ERROR", e, convertedTemplate);
                                } else if (template.includes(".slice(-1)[0]")) {
                                    failSlice++;
                                } else {
                                    failedOther++;
                                    console.log("OG TEMPLATE", template)
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
        console.log("FAILED because of regex", failRegex);
        console.log("FAILED because of slice", failSlice);
        console.log(chalk.bgWhiteBright("                    "));
        console.log(chalk.red("FAILED UNKNOWN REASON"), a);
        console.log(chalk.bgWhiteBright("                    "));
        // console.log(chalk.gray("INFO"));
        // console.log(results)
    }
);
