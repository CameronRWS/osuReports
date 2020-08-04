<template>
  <div class="relative">
    <canvas ref="chart" maintainAspectRatio="true" @click="clicked"></canvas>
  </div>
</template>

<script>
import Chart from "chart.js";
export default {
  props: {
    dataPoints: Array,
    xProp: [String, Function],
    yProp: [String, Function],
    xLabel: String,
    yLabel: String,
    yTicks: { type: Function, required: false, default: value => value },
    reverse: { type: Boolean, required: false, default: false }
  },
  computed: {
    /** @returns {any[]} */
    xData() {
      const accessor =
        typeof this.xProp === "function"
          ? /** @type {(el: any) => any} */ (this.xProp)
          : el => el[/** @type {string} */ (this.xProp)];
      return /** @type {any[]} */ (this.dataPoints.map(accessor));
    },
    /** @returns {any[]} */
    yData() {
      const accessor =
        typeof this.yProp === "function"
          ? /** @type {(el: any) => any} */ (this.yProp)
          : el => el[/** @type {string} */ (this.yProp)];
      return /** @type {any[]} */ (this.dataPoints.map(accessor));
    },
    /** @returns {Chart} */
    chart() {
      const canvas = /** @type {HTMLCanvasElement|undefined} */ (this.$refs
        .chart);
      if (!canvas) return;

      const ctx = canvas.getContext("2d");

      return new Chart(ctx, {
        type: "line",
        data: {
          labels: this.xData,
          datasets: [
            {
              label: this.yLabel,
              data: this.yData,
              fill: false,
              backgroundColor: "rgba(77, 164, 248, 0.5)",
              borderColor: "rgba(77, 164, 248, 1)",
              borderWidth: 1
            }
          ]
        },
        maintainAspectRatio: true,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  reverse: this.reverse,
                  beginAtZero: false,
                  callback: this.yTicks
                }
              }
            ]
          }
        }
      });
    }
  },
  methods: {
    clicked(evt) {
      const [point] = this.chart.getElementsAtEvent(evt) || [];
      if (!point) return;
      const label = this.chart.data.labels[point._index];
      const value = this.chart.data.datasets[point._datasetIndex].data[
        point._index
      ];
      console.log(point._index, value, point);
      this.$emit(
        "click",
        Object.assign(evt, { chart: this.chart, point, label, value })
      );
    }
  },
  mounted() {
    this.chart; // reference the chart to draw it
  }
};
</script>
