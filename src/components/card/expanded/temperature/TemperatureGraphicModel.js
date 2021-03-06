export default class TemperatureGraphicModel {
  constructor (width, maxTemperatura) {
    this.vsSpec = {
      description: 'Últimos 30 dias',
      $schema: 'https://vega.github.io/schema/vega-lite/v3.3.0.json',
      height: 100,
      width: width * 0.8,
      autosize: {
        type: 'fit',
        contains: 'padding'
      },
      title: '',
      data: {
        name: 'temperatura'
      },
      mark: {
        type: 'bar',
        color: '#9b5498',
        fillOpacity: 0.5
      },
      encoding: {
        x: {
          field: 'periodo',
          type: 'ordinal',
          format: '%Y-%m-%d',
          scale: {
            type: 'band'
          },
          axis: {
            title: '',
            grid: false,
            ticks: false,
            labels: false
          }
        },
        y: {
          field: 'temperatura_recente',
          type: 'quantitative',
          axis: {
            title: '',
            grid: false,
            labels: false,
            ticks: false
          },
          scale: { domain: [0, maxTemperatura] }
        },
        tooltip: [
          { 'field': 'temperatura_recente', 'type': 'quantitative', 'title': 'Temperatura' },
          { 'field': 'periodoTooltip', 'type': 'nominal', 'title': 'Semana' }
        ]
      },
      config: {
        view: {
          stroke: 'transparent'
        },
        axisY: {
          minExtent: 0,
          domain: false
        }
      }
    }
  }

  get getModel () {
    return this.vsSpec
  }
}
