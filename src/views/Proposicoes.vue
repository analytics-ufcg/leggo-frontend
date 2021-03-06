<template>
  <div class="content">
    <div class="sessao">
      <lista-anotacoes :date="dateRef" />
    </div>
    <div class="sessao">
      <ultimos-eventos />
    </div>
    <p v-if="pending.proposicoes">
      Carregando proposições
      <i class="el-icon-loading" />
    </p>
    <p v-else-if="error.proposicoes">Falha no carregamento</p>
    <transition
      v-else
      name="el-fade-in"
      mode="out-in">
      <div>
        <h2>
          Proposições
          <br>
          <small
            class="desc-titulo">
            {{ emPauta.length + notEmPauta.length }} proposições
            <span
              v-if="getInteresse === 'congresso-remoto'">
              que provavelmente tramitaram no período da pandemia
            </span>
          </small>
        </h2>
        <filter-button />
        <div v-if="filteredProps.length">
          <div
            v-if="emPauta.length"
            class="session">
            <header ref="emPautaHeader">
              <h3 :class="{disabled: emPauta.length === 0}">Na pauta oficial</h3>
            </header>
            <div v-if="emPauta.length">
              <temperature-button />
            </div>
            <div ref="emPautaSession">
              <proposicao-item
                :id="prop.id_leggo"
                :key="prop.id_leggo"
                v-for="prop in emPauta"
                :prop="prop"
                :progresso="progressos[prop.id_leggo]"
              />
            </div>
          </div>
          <div
            v-if="notEmPauta.length"
            class="session">
            <header ref="notEmPautaHeader">
              <h3 :class="{disabled: notEmPauta.length === 0}">Fora da pauta oficial da semana</h3>
            </header>
            <div v-if="notEmPauta.length">
              <temperature-button />
            </div>
            <div
              ref="notEmPautaSession"
              class="section">
              <proposicao-item
                :id="prop.id_leggo"
                :key="prop.id_leggo"
                v-for="prop in propPaged"
                :prop="prop"
                :progresso="progressos[prop.id_leggo]"
              />
              <pagination-bar
                :size="Math.ceil(notEmPauta.length / quantityProp)"
                :limit="10"
                :initial="pageNumber"
                @change="(number) => updatePageNumber(number)"
              />
            </div>
          </div>
        </div>
        <p v-else>Nenhuma proposição para mostrar...</p>
      </div>
    </transition>
  </div>
</template>

<script>
import ProposicaoItem from '@/components/card/ProposicaoItem'
import UltimosEventos from '@/components/UltimosEventos'
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import { removeAcentos } from '@/utils'
import PaginationBar from '@/components/utils/PaginationBar'
import FilterButton from '@/components/menu/FilterButton'
import ListaAnotacoes from '@/components/card/expanded/anotacao/ListaDeAnotacoes'
import TemperatureButton from '@/components/menu/TemperatureButton'

export default {
  name: 'Proposicoes',
  components: {
    ProposicaoItem,
    UltimosEventos,
    FilterButton,
    PaginationBar,
    ListaAnotacoes,
    TemperatureButton
  },
  data () {
    return {
      activeNames: [],
      quantityProp: 10
    }
  },
  methods: {
    ...mapActions(['listProposicoes', 'maxTemperatura']),
    ...mapMutations(['setPageNumber']),

    checkCategoricalFilters (prop) {
      return this.filter.filters.every(
        filter =>
          this.getCurrent[filter].length === 0 ||
          this.filter.current[filter].some(v => {
            if (prop[filter]) {
              return prop[filter].includes(v)
            }
            return prop.lastEtapa[filter].includes(v)
          })
      )
    },
    checkPautaFilter (prop) {
      const propId = prop.id
      const emPauta =
        this.pautas && this.pautas[propId] && this.pautas[propId].length > 0

      return !this.filter.emPautaFilter.some(options => options.status)
        ? true
        : emPauta
    },
    checkStatusFilter (prop) {
      return this.filter.showFinalizadas.status || prop.status === 'Ativa'
    },
    checkApelidoFilter (prop) {
      const apelido = removeAcentos(
        prop.sigla.toLowerCase() + prop.apelido.toLowerCase()
      )
      const filtro = removeAcentos(
        this.filter.nomeProposicaoFilter.toLowerCase()
      )
      return apelido.match(filtro)
    },
    checkPropMatchesFilter (prop) {
      return (
        this.checkCategoricalFilters(prop) &&
        this.checkPautaFilter(prop.lastEtapa)
      )
    },
    updateSticky (refHeader, refSession) {
      if (!refSession || !refHeader) return

      // Faz com que o tamanho da barra seja redimensionado conforme o tamanho da janela
      refHeader.style.width = `${refSession.getBoundingClientRect().width}px`

      if (refSession.getBoundingClientRect().top > 0) {
        refSession.style.paddingTop = '0px'
        refHeader.classList.remove('sticky')
      }
      if (refHeader.getBoundingClientRect().top <= 0) {
        refSession.style.paddingTop = `${
          refHeader.getBoundingClientRect().height
        }px`
        refHeader.classList.add('sticky')
      }
    },
    sticky () {
      this.updateSticky(this.$refs.emPautaHeader, this.$refs.emPautaSession)
      this.updateSticky(
        this.$refs.notEmPautaHeader,
        this.$refs.notEmPautaSession
      )
    },
    updatePageNumber (number) {
      this.setPageNumber(number)
    }
  },
  computed: {
    ...mapGetters([
      'perFilterOptions',
      'formattedDateRef',
      'getCurrent',
      'getInteresse',
      'getNomeInteresse'
    ]),
    filteredProps () {
      // Teste para ver se o obj com os filtros já foi inicializado
      if (Object.keys(this.getCurrent).length) {
        return this.proposicoes
          .filter(prop => {
            return (
              this.checkPropMatchesFilter(prop) &&
              this.checkStatusFilter(prop.lastEtapa) &&
              this.checkApelidoFilter(prop)
            )
          })
          .sort((a, b) => {
            let idA = a.lastEtapa.id
            let idB = b.lastEtapa.id
            let pautaA =
              this.pautas &&
              this.pautas[idA] !== undefined &&
              this.pautas[idA].length > 0
            let pautaB =
              this.pautas &&
              this.pautas[idB] !== undefined &&
              this.pautas[idB].length > 0
            let n = pautaB - pautaA
            if (n !== 0) {
              return n
            }

            if (this.pressoes) {
              let tempA =
                a.ultima_temperatura === undefined
                  ? 0
                  : a.ultima_temperatura
              let tempB =
                b.ultima_temperatura === undefined
                  ? 0
                  : b.ultima_temperatura
              let pressaoA =
                this.pressoes[a.id_leggo] === undefined
                  ? 0
                  : this.pressoes[a.id_leggo]
              let pressaoB =
                this.pressoes[b.id_leggo] === undefined
                  ? 0
                  : this.pressoes[b.id_leggo]

              if (this.filter.temperatureOrder === 'desc') {
                let comp = tempB - tempA
                if (comp !== 0) {
                  return comp
                } else {
                  return pressaoB - pressaoA
                }
              } else {
                let comp = tempA - tempB
                if (comp !== 0) {
                  return comp
                } else {
                  return pressaoA - pressaoB
                }
              }
            } else {
              return 0
            }
          })
      } else {
        return this.proposicoes
      }
    },
    propPaged () {
      const init = this.pageNumber * this.quantityProp
      const end = (this.pageNumber + 1) * this.quantityProp
      return this.notEmPauta.slice(init, end)
    },
    ...mapState({
      proposicoes: state => state.proposicoes.proposicoes,
      pending: state => state.proposicoes.pending,
      error: state => state.proposicoes.error,
      filter: state => state.filter,
      pageNumber: state => state.filter.pageNumber,
      pautas: state => state.pautas.pautas,
      pressoes: state => state.pressao.ultimasPressoes,
      dateRef: state => state.filter.dateRef,
      progressos: state => state.progressos.progressos
    }),
    emPauta () {
      return this.filteredProps.filter(prop => {
        const propId = prop.lastEtapa.id
        return (
          this.pautas && this.pautas[propId] && this.pautas[propId].length > 0
        )
      })
    },
    notEmPauta () {
      return this.filteredProps.filter(prop => {
        const propId = prop.lastEtapa.id
        return !(
          this.pautas &&
          this.pautas[propId] &&
          this.pautas[propId].length > 0
        )
      })
    }
  },
  async mounted () {
    window.addEventListener('scroll', this.sticky)
    window.addEventListener('resize', this.sticky)
  }
}
</script>

<style lang="scss" scoped>
@import "@/base.scss";

.flex {
  display: flex;
  flex-wrap: wrap;
}
.session {
  position: relative;
  &:first-child {
    padding-top: 0;
  }
  h2 {
    font-weight: normal;
    font-size: 1.6rem;
    margin: 0;
    padding: 0;
    color: #656565;
  }
  .disabled {
    color: #bbb;
  }
}
.content {
  padding: 0vh 0.5rem 0 0.5rem;
}
.sticky {
  display: block;
  position: fixed;
  top: 0;
  z-index: 20;
  background: #fff;
  border-bottom: solid 3px #dadada;
}
.section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.interesse {
  display: block;
  font-weight: normal;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #656565;
}
.sessao {
  margin-bottom: 3rem;
}
.desc-titulo {
  font-size: 0.9rem;
  font-weight: normal;
}
</style>
