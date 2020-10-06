<template>
  <div class="relative">
    <canvas ref="chart" maintainAspectRatio="true" @click="clicked"></canvas>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Chart from "chart.js";

export default Vue.extend({
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
    xData(): any[] {
      const accessor =
        typeof this.xProp === "function"
          ? (this.xProp as (el: any) => any)
          : el => el[this.xProp as string];
      return this.dataPoints.map(accessor);
    },
    yData(): any[] {
      const accessor =
        typeof this.yProp === "function"
          ? (this.yProp as (el: any) => any)
          : el => el[this.yProp as string];
      return this.dataPoints.map(accessor);
    },
    chart(): Chart {
      const canvas: HTMLCanvasElement | undefined = this.$refs.chart as any;
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
    clicked(evt): void {
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
});
</script>
