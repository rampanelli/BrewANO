const isFahrenheit = (temp) => temp > 150;

const toCelsius = (temp) => isFahrenheit(temp) ? Math.round((temp - 32) * 5 / 9) : temp;

const parseKgToGrams = (amount) => {
  if (amount < 1) return Math.round(amount * 1000);
  return Math.round(amount);
};

function parseBSMX(xmlDoc) {
  const mashSteps = [];
  const boilSteps = [];
  let brewSettings = {};

  const recipe = xmlDoc.querySelector("Recipe");
  if (recipe) {
    const boilTime = getText(recipe, "F_R_BOIL_TIME");
    if (boilTime) brewSettings.bt = parseInt(boilTime);
  }

  const mashNodes = xmlDoc.querySelectorAll("MashStep");
  mashNodes.forEach(step => {
    const name = getText(step, "F_MS_NAME");
    const temp = parseFloat(getText(step, "F_MS_STEP_TEMP") || "0");
    const time = parseInt(getText(step, "F_MS_STEP_TIME") || "0");
    if (name && temp > 0 && time > 0) {
      mashSteps.push({
        n: name,
        t: toCelsius(temp),
        tm: time,
        r: true,
        sl: false,
        ho: true,
        fp: false
      });
    }
  });

  const hopNodes = xmlDoc.querySelectorAll("Hop");
  hopNodes.forEach(hop => {
    const name = getText(hop, "F_H_NAME");
    const time = parseInt(getText(hop, "F_H_BOIL_TIME") || "0");
    const amount = getText(hop, "F_H_AMOUNT");
    if (name && time > 0) {
      boilSteps.push({
        n: name,
        tm: time,
        a: amount ? parseKgToGrams(parseFloat(amount)) : 0
      });
    }
  });

  return { mashSteps, boilSteps, brewSettings };
}

function parseBeerXML(xmlDoc) {
  const mashSteps = [];
  const boilSteps = [];
  let brewSettings = {};

  const recipe = xmlDoc.querySelector("RECIPE");
  if (recipe) {
    const boilTime = getText(recipe, "BOIL_TIME");
    if (boilTime) brewSettings.bt = parseInt(boilTime);
  }

  const mashStepNodes = xmlDoc.querySelectorAll("MASH_STEP");
  mashStepNodes.forEach(step => {
    const name = getText(step, "NAME");
    const temp = parseFloat(getText(step, "STEP_TEMP") || "0");
    const time = parseInt(getText(step, "STEP_TIME") || "0");
    if (name && temp > 0 && time > 0) {
      mashSteps.push({
        n: name,
        t: toCelsius(temp),
        tm: time,
        r: true,
        sl: false,
        ho: true,
        fp: false
      });
    }
  });

  const hopNodes = xmlDoc.querySelectorAll("HOP");
  hopNodes.forEach(hop => {
    const name = getText(hop, "NAME");
    const time = parseInt(getText(hop, "TIME") || "0");
    const amount = getText(hop, "AMOUNT");
    if (name && time > 0) {
      boilSteps.push({
        n: name,
        tm: time,
        a: amount ? parseKgToGrams(parseFloat(amount)) : 0
      });
    }
  });

  return { mashSteps, boilSteps, brewSettings };
}

function parseJSON(json) {
  const mashSteps = [];
  const boilSteps = [];
  let brewSettings = {};

  if (json.boil_time) brewSettings.bt = parseInt(json.boil_time);

  if (json.mash && json.mash.mash_steps) {
    json.mash.mash_steps.forEach(step => {
      if (step.name && step.step_temp > 0 && step.step_time > 0) {
        mashSteps.push({
          n: step.name,
          t: toCelsius(parseFloat(step.step_temp)),
          tm: parseInt(step.step_time),
          r: true, sl: false, ho: true, fp: false
        });
      }
    });
  }

  if (json.hops) {
    json.hops.forEach(hop => {
      if (hop.name && hop.time > 0) {
        boilSteps.push({
          n: hop.name,
          tm: parseInt(hop.time),
          a: hop.amount ? parseKgToGrams(parseFloat(hop.amount)) : 0
        });
      }
    });
  }

  return { mashSteps, boilSteps, brewSettings };
}

function getText(parent, tagName) {
  const el = parent.querySelector(tagName);
  return el ? el.textContent : null;
}

export function parseBeerSmithFile(fileContent, fileName) {
  const isXML = /\.(bsmx|xml)$/i.test(fileName) || fileContent.trim().startsWith("<?xml") || fileContent.trim().startsWith("<Recipes") || fileContent.trim().startsWith("<RECIPES");

  if (isXML) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(fileContent, "text/xml");
    const errorNode = xmlDoc.querySelector("parsererror");
    if (errorNode) {
      throw new Error("Invalid XML file: " + errorNode.textContent);
    }

    if (xmlDoc.querySelector("Recipe") || xmlDoc.querySelector("Recipes")) {
      return parseBSMX(xmlDoc);
    }
    return parseBeerXML(xmlDoc);
  }

  try {
    const json = JSON.parse(fileContent);
    return parseJSON(json);
  } catch (e) {
    throw new Error("Unsupported file format. Please use BeerSmith .bsmx, BeerXML .xml, or BeerSmith JSON export.");
  }
}
