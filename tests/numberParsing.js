function formatDifference(number, nDec, suffix) {
  let formatted;

  if (number === NaN) {
    return "";
  }

  if (nDec !== undefined) {
    number = number.toFixed(nDec);
    formatted = number.toString();
  } else {
    formatted = number.toLocaleString("en");
  }

  // we don't want it to be undefined
  if (!suffix) suffix = "";

  if (number > 0) {
    return `(+${formatted}${suffix})`;
  }
  if (number < 0) {
    return `(${formatted}${suffix})`;
  }
  return "";
}

function origDifGlobalRank(difGlobalRank) {
  difGlobalRank *= -1;
  if (difGlobalRank < 0 && difGlobalRank != "NaN") {
    var tempDifGlobalRank = difGlobalRank;
    tempDifGlobalRank = tempDifGlobalRank.toString();
    tempDifGlobalRank = tempDifGlobalRank.substring(
      1,
      tempDifGlobalRank.length
    );
    tempDifGlobalRank = parseFloat(tempDifGlobalRank).toLocaleString("en");
    tempDifGlobalRank = tempDifGlobalRank.toString();
    difGlobalRank = "(+" + tempDifGlobalRank + ")";
  } else if (difGlobalRank > 0 && difGlobalRank != "NaN") {
    var tempDifGlobalRank = difGlobalRank;
    tempDifGlobalRank = tempDifGlobalRank.toString();
    tempDifGlobalRank = parseFloat(tempDifGlobalRank).toLocaleString("en");
    tempDifGlobalRank = tempDifGlobalRank.toString();
    difGlobalRank = "(-" + tempDifGlobalRank + ")";
  } else {
    difGlobalRank = "";
  }
  return difGlobalRank;
}

function origDifCountryRank(difCountryRank) {
  difCountryRank *= -1;
  if (difCountryRank < 0 && difCountryRank != "NaN") {
    var tempDifCountryRank = difCountryRank;
    tempDifCountryRank = tempDifCountryRank.toString();
    tempDifCountryRank = tempDifCountryRank.substring(
      1,
      tempDifCountryRank.length
    );
    tempDifCountryRank = parseFloat(tempDifCountryRank).toLocaleString("en");
    tempDifCountryRank = tempDifCountryRank.toString();
    difCountryRank = "(+" + tempDifCountryRank + ")";
  } else if (difCountryRank > 0 && difCountryRank != "NaN") {
    var tempDifCountryRank = difCountryRank;
    tempDifCountryRank = tempDifCountryRank.toString();
    tempDifCountryRank = parseFloat(tempDifCountryRank).toLocaleString("en");
    tempDifCountryRank = tempDifCountryRank.toString();
    difCountryRank = "(-" + tempDifCountryRank + ")";
  } else {
    difCountryRank = "";
  }
  return difCountryRank;
}

function origDifLevel(difLevel) {
  difLevel = difLevel.toFixed(0);
  if (difLevel > 0) {
    difLevel = "(+" + difLevel + "%)";
  } else if (difLevel < 0) {
    difLevel = "(" + difLevel + "%)";
  } else {
    difLevel = "";
  }
  return difLevel;
}

function origDifRankedScore(difRankedScore) {
  if (difRankedScore > 0) {
    difRankedScore =
      "(+" + parseFloat(difRankedScore).toLocaleString("en") + ")";
  } else if (difRankedScore < 0) {
    difRankedScore =
      "(" + parseFloat(difRankedScore).toLocaleString("en") + ")";
  } else {
    difRankedScore = "";
  }
  return difRankedScore;
}

function origDifAcc(difAcc) {
  if (difAcc > 0 && parseFloat(difAcc).toFixed(2) != 0.0) {
    difAcc = "(+" + parseFloat(difAcc).toFixed(2) + "%)";
  } else if (difAcc < 0 && parseFloat(difAcc).toFixed(2) != 0.0) {
    difAcc = "(" + parseFloat(difAcc).toFixed(2) + "%)";
  } else {
    difAcc = "";
  }
  return difAcc;
}

function origDifPP(difPP) {
  if (difPP > 0) {
    difPP = "(+" + difPP.toFixed(2) + ")";
  } else if (difPP < 0) {
    difPP = "(" + difPP.toFixed(2) + ")";
  } else {
    difPP = "";
  }
  return difPP;
}

function origDifPlayCount(difPlayCount) {
  if (difPlayCount > 0) {
    difPlayCount = "(+" + parseFloat(difPlayCount).toLocaleString("en") + ")";
  } else if (difPlayCount < 0) {
    difPlayCount = "(" + parseFloat(difPlayCount).toLocaleString("en") + ")";
  } else {
    difPlayCount = "";
  }
  return difPlayCount;
}

const tests = [
  [1204, undefined, "", "(+1,204)", origDifGlobalRank],
  [-1506, undefined, "", "(-1,506)", origDifCountryRank],
  [12.5, 0, "%", "(+13%)", origDifLevel],
  [12.5, undefined, "", "(+12.5)", origDifRankedScore],
  [-0.2543, 2, "%", "(-0.25%)", origDifAcc],
  [10.2543, 2, "", "(+10.25)", origDifPP],
  [12430.3, undefined, "", "(+12,430.3)", origDifPlayCount],
  [NaN, undefined, "", "", origDifGlobalRank],
  [NaN, undefined, "", "", origDifCountryRank],
];

function runTests() {
  for (const test of tests) {
    const [input, nDec, suffix, expected, orig] = test;
    let origOutput = orig(input);
    let newOutput = formatDifference(input, nDec, suffix);
    if (newOutput !== expected || origOutput !== expected) {
      console.error(
        `Expected output: ${expected}\n\tOriginal function ${orig.name}: ${origOutput}\n\tOur function: ${newOutput}`
      );
    }
  }
}

runTests();
