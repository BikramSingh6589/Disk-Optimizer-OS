// Disk Usage Chart
new ApexCharts(document.querySelector('[data-chart="chart_0"]'), {
  chart: { type: "area", height: 250, toolbar: { show: false } },
  colors: ["#611bf8", "#7341ff", "#f59e0b", "#f87171"],
  fill: { type: "gradient", gradient: { opacityFrom: 0.6, opacityTo: 0.1 } },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  legend: { position: "top" },
  series: [
    { name: "System Files", data: [30, 32, 38, 42, 40, 45, 48] },
    { name: "User Files", data: [45, 52, 68, 74, 78, 85, 92] },
    { name: "Applications", data: [35, 38, 42, 47, 55, 60, 65] },
    { name: "Temporary", data: [15, 22, 18, 24, 28, 35, 32] },
  ],
}).render();

// File Type Pie Chart
new ApexCharts(document.querySelector('[data-chart="chart_1"]'), {
  chart: { type: "pie", height: 180, toolbar: { show: false } },
  colors: ["#611bf8", "#b7a9ff", "#f59e0b", "#10b981", "#f87171"],
  labels: ["Documents", "Media", "Applications", "System", "Other"],
  legend: { position: "bottom" },
  series: [42, 28, 15, 10, 5],
}).render();

// Fragmentation Radial Chart
new ApexCharts(document.querySelector('[data-chart="chart_2"]'), {
  chart: { type: "radialBar", height: 180, toolbar: { show: false } },
  colors: ["#611bf8", "#f59e0b", "#10b981"],
  plotOptions: {
    radialBar: {
      hollow: { size: "40%" },
      dataLabels: { total: { show: true, label: "Average" } },
    },
  },
  labels: ["C: Drive", "D: Drive", "E: Drive"],
  series: [68, 42, 18],
}).render();
