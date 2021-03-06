<template>
  <div
    class="prop-item"
    autofocus>
    <text-tag
      class="tag"
      :etapas="prop.etapas" />
    <div class="portal">
      <p
        class="small-text-field"
        v-if="prop.sigla_camara !== null && prop.sigla_senado !== null">
        <a
          class="sigla"
          :href="prop.url"
          target="_blank">{{ prop.sigla_camara }}</a>
        - Câmara
        <a
          class="sigla"
          :href="prop.url"
          target="_blank">{{ prop.sigla_senado }}</a>
        - Senado
      </p>
      <p
        class="small-text-field"
        v-else-if="prop.sigla_camara !== null && prop.sigla_senado === null">
        <a
          class="sigla"
          :href="prop.url"
          target="_blank">{{ prop.sigla_camara }}</a>
        - Câmara
      </p>
      <p
        class="small-text-field"
        v-else>
        <a
          class="sigla"
          :href="prop.url"
          target="_blank">{{ prop.sigla_senado }}</a>
        - Senado
      </p>
    </div>
    <div class="container pl-actions">
      <el-tooltip
        placement="bottom"
        effect="light">
        <div
          class="tooltip-content"
          slot="content"> Aqui se encontram notas técnicas de OSCs sobre esta proposição.
        </div>
        <a
          v-if="prop.advocacy_link !== 'nan' && prop.advocacy_link !== null"
          :href="prop.advocacy_link"
          target="_blank">
          <i class='bx bx-box'/>
          Advocacy box
        </a>
      </el-tooltip>
    </div>
    <div class="sessao">
      <author-name
        class="small-margin-top"
        :author="prop.autoresProposicao" />
      <p class="small-text-field small-margin-top">{{ getNomeAutor() }}</p>
      <p class="medium-text-field small-margin-top">{{ getRelator() }}</p>
      <p class="small-text-field small-margin-top">Relator(a)</p>
      <p
        v-if="temTipoAgenda"
        class="medium-text-field small-margin-top">{{ tipoAgendaFormatado }}</p>
      <p
        v-if="temTipoAgenda"
        class="small-text-field small-margin-top">Tipo da Agenda</p>
    </div>

    <h2>Temperatura e Pressão</h2>
    <graphics :prop="prop"/>

    <div class="sessao">
      <h2>Progresso da Tramitação</h2>
      <fases-progress
        class="fases-progress"
        :class="{'visible': true}"
        :fases="progressoProp"
        :etapas="prop.etapas"
      />
      <composicao-link
        :data-local-atual="dataLocalAtual"
        :sigla-comissao-link="siglaParaLink"
        :sigla-comissao-front="siglaFormatada"
        :casa-comissao="prop.lastEtapa.casa"
      />
    </div>
    <div class="sessao">
      <anotacao-prop
        :id="prop.id_leggo"
        :date="dateRef" />
    </div>
    <div class="sessao">
      <h2>Últimos Eventos</h2>
      <eventos-info
        :id="prop.lastEtapa.id_ext"
        :casa="prop.lastEtapa.casa"
        :date="dateRef" />
    </div>
    <div class="sessao">
      <h2>Atividade Parlamentar</h2>
      <p class="explicacao_feature">Atuação parlamentar <span class="destaque_cor">a partir de 2019.</span></p>
      <h3>Os 15 Parlamentares mais ativos</h3>
      <tab-atores-graphics
        :casa="prop.lastEtapa.casa"
        :sigla="prop.lastEtapa.sigla"
        :important_atores="prop.important_atores"
        :id_leggo="prop.id_leggo"
        :apelido="prop.apelido"/>
      <h3>Rede de Influência</h3>
      <peso-politico-graph :id_leggo="prop.id_leggo"/>
    </div>
    <div class="sessao">
      <h2>Análise das Emendas</h2>
      <div
        v-for="(etapa,i) in revChronSortedEtapas"
        :key="i">
        <etapa-proposicao
          :id_leggo="prop.id_leggo"
          :etapa="etapa"
          :id-last-etapa="prop.lastEtapa.id"
          :casa="getCasa(etapa)"
          :date="dateRef"/>
      </div>
    </div>
    <div>
      <pautas-info
        :id="prop.lastEtapa.id_ext"
        :casa="prop.lastEtapa.casa"
        :date="dateRef" />
    </div>
  </div>

</template>

<script>
import RegimeTramitacao from './collapsed/RegimeTramitacao.vue'
import FormaApreciacao from './collapsed/FormaApreciacao.vue'
import FasesProgress from './expanded/FasesProgress'
import EtapaProposicao from './EtapaProposicao'
import TextTag from './collapsed/TextTag'
import Graphics from './expanded/Graphics'
import PesoPoliticoGraph from '@/components/card/expanded/rede/PesoPoliticoGraph.vue'
import TabAtoresGraphics from './expanded/atores/TabAtoresGraphics'
import EventosInfo from './expanded/EventosInfo'
import ComposicaoLink from './expanded/ComposicaoLink'
import PautasInfo from './expanded/PautasInfo'
import AuthorName from './expanded/AuthorName'
import AnotacaoProp from './expanded/anotacao/AnotacaoPorProposicao'

import { mapState } from 'vuex'
import moment from 'moment'

export default {
  name: 'Proposicaoitem',
  data () {
    return {
      dropShow: false
    }
  },
  props: {
    prop: {
      type: Object,
      default: undefined
    }
  },
  components: {
    RegimeTramitacao,
    FormaApreciacao,
    FasesProgress,
    EtapaProposicao,
    TextTag,
    Graphics,
    PesoPoliticoGraph,
    TabAtoresGraphics,
    EventosInfo,
    ComposicaoLink,
    PautasInfo,
    AuthorName,
    AnotacaoProp
  },
  methods: {
    hasNumber (myString) {
      return /\d/.test(myString)
    },
    getNomeAutor () {
      return this.prop.autoresProposicao.length > 1 ? 'Autores' : 'Autor'
    },
    getRelator () {
      const relatoria = this.prop.lastEtapa.relatoria
      let relator = 'Relator não encontrado'
      if (relatoria !== null) {
        const cargo = relatoria.casa === 'camara' ? 'Dep.' : 'Sen.'
        relator = cargo + ' ' + relatoria.nome + ' (' + relatoria.partido + '/' + relatoria.uf + ')'
      }

      return relator
    },
    capitalizeFirstLetter (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
    getCasa (etapa) {
      if (this.prop.etapas[0].sigla_tipo === 'MPV') {
        if (this.prop.etapas.length === 1 || (this.prop.lastEtapa.casa === 'senado' && etapa.casa === 'senado')) {
          return 'Congresso'
        }
      }

      return etapa.casa
    }
  },
  computed: {
    revChronSortedEtapas () {
      function dataApresCasa (a, b) {
        if (a.sigla_tipo === 'MPV' & b.sigla_tipo === 'MPV') {
          if (a.casa < b.casa) return 1
          if (a.casa > b.casa) return -1
        } else {
          if (a.data_apresentacao < b.data_apresentacao) return 1
          if (a.data_apresentacao > b.data_apresentacao) return -1
        }
      }
      return [...this.prop.etapas].sort(dataApresCasa)
    },
    siglaParaLink () {
      let siglaParaLink = this.localAtual
      if (
        this.localAtual === 'Comissão Especial' ||
        this.localAtual === 'Plenário' ||
        this.localAtual === 'Presidência da República'
      ) {
        siglaParaLink = this.siglaLocalAtual
      }
      if (this.hasNumber(siglaParaLink)) {
        siglaParaLink = siglaParaLink.replace(/\s/g, '').split('/')
        siglaParaLink = siglaParaLink[0]
      }
      return siglaParaLink.replace(/\(|\)/g, '')
    },
    localAtual () {
      const locais = this.prop.lastEtapa.resumo_tramitacao
      const localAtual = locais[locais.length - 1].local
      return localAtual
    },
    siglaLocalAtual () {
      const locais = this.prop.lastEtapa.resumo_tramitacao
      const siglaLocalAtual = locais[locais.length - 1].sigla_local
      return siglaLocalAtual
    },
    siglaFormatada () {
      let siglaFormatada = this.localAtual
      if (this.localAtual === 'Comissão Especial') {
        siglaFormatada = this.siglaLocalAtual
      }
      if (this.hasNumber(siglaFormatada)) {
        siglaFormatada = 'Comissão Especial - ' + siglaFormatada
      }
      return siglaFormatada
    },
    dataLocalAtual () {
      const data = this.prop.lastEtapa.resumo_tramitacao.slice(-1)[0].data
      return moment(data).format('DD/MM/YYYY')
    },
    emPauta () {
      return this.etapa.emPauta
    },
    temTipoAgenda () {
      const tipoAgenda = this.prop.tipo_agenda
      return tipoAgenda !== 'nan' && tipoAgenda !== null
    },
    tipoAgendaFormatado () {
      const tipoAgenda = this.prop.tipo_agenda.toLowerCase()
      if (tipoAgenda === 'positiva') {
        return 'Positiva'
      } else if (tipoAgenda === 'negativa') {
        return 'Negativa'
      } else {
        return 'Não avaliada'
      }
    },
    ...mapState({
      dateRef: state => state.filter.dateRef,
      pautas: state => state.pautas.pautas,
      progressoProp: state => state.progressos.progressoProp
    })
  }
}
</script>

<style lang="scss" scoped>
@import "@/base.scss";
@import url('https://unpkg.com/boxicons@2.0.3/css/boxicons.min.css');
.sigla {
  font-size: 14px;
}
.prop-item {
  padding: 0 1rem 1.5rem 1rem;
}
.small-text-field {
  font-size: 10pt;
  color: gray;
  margin: 0 10px 10px 0;
}
.fases-progress {
  visibility: hidden;
  opacity: 0;
  margin-top: 2rem;
  // margin-bottom: 2rem;
}
.visible {
  visibility: visible;
  opacity: 1;
  transition: opacity 1s linear;
}
.tag {
  padding-bottom: 5px;
  font-size: 11pt;
}
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-right: 10px;
}
.portal {
  margin-bottom: 1.5rem;
  display: flex;
}
@media (min-width: 768px) {
  .portal {
    margin-left: 15px;
  }
}
.pl-actions {
  flex-direction: row-reverse;
}
.advocacy-box {
  justify-content: center;
  color: $--color-primary;
  font-size: 2rem;
}
.medium-text-field {
  margin: 0;
}
.sessao {
  margin-bottom: 3rem;
}
@media screen and (max-width: 600px) {
  .tooltip-content {
    max-width: 250px;
  }
}
.tooltip-content {
  color: gray;
}
.explicacao_feature {
  font-size: 0.85rem;
}
.destaque_cor {
  font-weight: bold;
}
</style>
