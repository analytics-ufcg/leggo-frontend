export function resumirFases (fases) {
  // Caso alguma fase da Revisão II tenha sido iniciada
  let showRev2 = fases.some(fase => fase.fase_global.indexOf('II') !== -1 && fase.data_inicio)
  if (showRev2) {
    // Mostra todas as fases
    return fases
  } else {
    // Não mostra Revisão II
    return fases.filter(fase => fase.fase_global.indexOf('II') === -1)
  }
}

// Remove os acentos de uma palavra de entrada e retorna o resultado (palavra sem acentos)
export function removeAcentos (word) {
  return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Verifica as etapas de uma proposição e retorna o status da proposicao
export default function retornaProposicaoComStatusGeral (prop) {
  let result = ''
  for (let etapa of prop.etapas) {
    switch (etapa.status) {
      case 'Lei':
        result = 'Transformada em Lei'
        break
      case 'Arquivada':
        result = 'Arquivada'
        break
      case 'Caducou':
        result = 'Caducou'
        break
      case 'Rejeitada':
        result = 'Rejeitada'
        break
    }
  }
  return result
}

// Remove os acentos de uma palavra de entrada e retorna o resultado (palavra sem acentos)
export function ordenaProgresso (resumoProgresso) {
  let ORDER = [
    'Comissão Mista',
    'Câmara dos Deputados',
    'Senado Federal',
    'Câmara dos Deputados - Revisão',
    'Sanção Presidencial/Promulgação'
  ]

  if (resumoProgresso.length && resumoProgresso[0].is_mpv === false) {
    ORDER = [
      'Construção-Comissões',
      'Construção-Plenário',
      'Revisão I-Comissões',
      'Revisão I-Plenário',
      'Revisão II-Comissões',
      'Revisão II-Plenário',
      'Promulgação/Veto-Presidência da República',
      'Sanção/Veto-Presidência da República',
      'Avaliação dos Vetos-Congresso'
    ]

    resumoProgresso = resumoProgresso.map(r => {
      r.fase_global_local = r.fase_global + '-' + r.local
      return r
    })

    resumoProgresso.sort(function (a, b) {
      return ORDER.indexOf(a.fase_global_local) - ORDER.indexOf(b.fase_global_local)
    })
  } else {
    resumoProgresso.sort(function (a, b) {
      return ORDER.indexOf(a.fase_global) - ORDER.indexOf(b.fase_global)
    })
  }

  return resumoProgresso
}
