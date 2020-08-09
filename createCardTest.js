const ReportCardGenerator = require("./src/reportCardGenerator");

run2();

function run2() {
  run();
}

async function run() {
  const finalReportCard = await ReportCardGenerator.generateReportCard(3003);
  await finalReportCard.writeAsync(`./out/testingCard.png`);
}
