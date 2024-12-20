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
        for (let j = 0; j < 4; j++) {
            obj[headers[j].trim()] = currentLine[j] ? currentLine[j].trim() : null;
        }

        // Add the remaining fields to the 'details' field and unescape double quotes
        let details = currentLine.slice(4).join(',');
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
            console.log('Details field is not valid JSON:', obj.details);
        }

        result.push(obj);
    }

    return result;
}


const url = process.argv[2] || "http://localhost:8080"

// Update this URL to match your server and file path
fetch(url).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.text();
    }
).then(res => {
        var a = 0;
        var results = {

        };
        var failLiquid = 0;
        var failCurrentUrl = 0;
        var failElif = 0;
        var failSet = 0;
        var failFilter = 0;
        var failNunjucks = 0;
        var csv = parseCSV(res);
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
                    //console.log(acts)
                    acts.forEach(act => {
                            var template = act.transformationConfig.template;
                            try {
                                window.checkLiquid(datum.website_id, datum.id, template, data);

                            } catch (e) {
                                if (e.message.includes("$currentUrl")) {
                                    failCurrentUrl++;
                                } else if (e.message.includes("tag \"elif\"")) {
                                    failElif++;
                                } else if (e.message.includes("tag \"set\"")) {
                                    console.warn(template);
                                    failSet++;
                                } else if (e.message.includes("expected \":\" after filter name")) {
                                    failFilter++;
                                    //console.warn("LIQUID ERROR", e, template);
                                } else {
                                    //console.warn("LIQUID ERROR", e, template);
                                }
                                failLiquid++;
                                results[datum.website_id] = results[datum.website_id] ?? {total:0};
                                results[datum.website_id][datum.id] = results[datum.website_id][datum.id] ?? {total: 0};

                                results[datum.website_id].total ++;
                                results[datum.website_id][datum.id].total ++;
                                //console.warn("end");
                            }
                            try {
                                window.checkNunjucks(template, data);
                            } catch (e) {
                                console.log("NUNJUCKS", e);
                                failNunjucks++;
                            }

                        }
                    )
                } catch (e) {
                    a++;
                }

                //console.log(datum.website_id, datum.id, datum.config, datum.config['transformationConfig']))
            }
        );
        console.log("FAILED", a);
        console.log("FAIL LIQUID", failLiquid);
        console.log("FAIL LIQUID because of currentUrl", failCurrentUrl);
        console.log("FAIL LIQUID because of elif", failElif);
        console.log("FAIL LIQUID because of set", failSet);
        console.log("FAIL LIQUID because of filter", failFilter);
        console.log("FAIL Nun", failNunjucks);
        console.log(results);
    }
).catch(error => {
        console.error('Error fetching JSON:', error);
    }
);