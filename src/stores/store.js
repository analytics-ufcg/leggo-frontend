import Vue from 'vue'
import Vuex from 'vuex'
import Vapi from 'vuex-rest-api'
import filter from './filter'

Vue.use(Vuex)

const proposicoes = new Vapi({
  baseURL: process.env.VUE_APP_API_URL,
  state: {
    proposicoes: [],
    tramitacoes: new Set()
  }
}).get({
  action: 'getProposicao',
  property: 'proposicao',
  path: ({ casa, idExt }) => `/proposicoes/${casa}/${idExt}`
}).get({
  action: 'listProposicoes',
  property: 'proposicoes',
  path: '/proposicoes'
}).get({
  action: 'getEnergiaRecente',
  path: ({ casa, id, semanas, date }) => `energia/${casa}/${id}?semanas_anteriores=${semanas}&data_referencia=${date}`,
  onSuccess: (state, { data }, axios, { params }) => {
    const propsFilter = state.proposicoes.map((prop) => {
      if(prop.id_ext == params.id){
        prop["energias"] = data
      }
      return prop;
    })
    console.log(params, data)
  }
}).getStore()

export default new Vuex.Store({
  modules: {
    proposicoes,
    filter
  }
})
