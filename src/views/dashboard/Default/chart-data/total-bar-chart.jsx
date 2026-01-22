const chartData = {
  height: 480,
  type: 'bar',
  options: {
    chart: {
      id: 'bar-chart',
      stacked: true,
      toolbar: { show: true },
      zoom: { enabled: true }
    },
    plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
    xaxis: { type: 'category', categories: [] },
    dataLabels: { enabled: false },
    grid: { show: true },
    legend: { show: true, position: 'bottom' }
  },
  series: [] 
};

export default chartData;
