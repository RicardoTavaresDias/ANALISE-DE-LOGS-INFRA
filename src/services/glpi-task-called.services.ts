import { FsGlpiRepository,  } from "@/repositories/fs-glpi-repository"
import standardizationUnits from "@/lib/standardization-units"
import { dayjs } from "@/config/dayjs"
import { DateType } from "@/schemas/log-analysis.schema"


const fsGlpiRepository = new FsGlpiRepository()

/**
 * Lista o conteúdo da pasta temporária.
 * @returns {string[]} Lista de arquivos encontrados.
 */

export function taskCalled () {
  const resultTmp = fsGlpiRepository.showFolderTmp('./tmp')
  
  return resultTmp
}

/**
 * Lê os arquivos da unidade informada.
 * @param {string} units - Nome da unidade/pasta a ser lida.
 * @returns {Promise<{ logs: string, isError: boolean }>} Resultado da leitura com logs.
 */

export async function readTaskCalled (units: string) {
  const result = await fsGlpiRepository.read(units)

  if(!result.contentSucess && result.contentError) {
    return { logs: result.contentError, isError: false }
  }

  if(!result.contentError && result.contentSucess) {
    return { logs: result.contentSucess, isError: true }
  }

  const text = result.contentSucess as string + result.contentError as string

  return { logs: text, isError: false }
}

/**
 * Remove a pasta de uma unidade específica.
 * @param {string} unit - Nome da unidade/pasta a ser removida.
 * @returns {boolean} Indica se a pasta foi removida com sucesso.
 */

export function removeFolderUnit (unit: string) {
  return fsGlpiRepository.removeFolder(unit)
}

/**
 * Valida os chamados existentes removendo as pastas temporárias associadas às unidades encontradas.
 *
 * - Remove tags `<br>` da lista de unidades recebidas.
 * - Filtra apenas os nomes de unidades, ignorando IDs de chamados no formato `\d{3}\d{3}`.
 * - Localiza as chaves de unidades padronizadas em `standardizationUnits`.
 * - Remove as pastas temporárias correspondentes em `./tmp`.
 * - Retorna a lista de pastas ainda existentes ou `false` caso nenhuma permaneça.
 *
 * @param {string[]} dataunits - Lista de valores extraídos dos chamados (contendo IDs e/ou nomes de unidades).
 * @returns {Promise<string[] | false>} Lista das pastas restantes no diretório `./tmp` ou `false` se não houver.
 * @throws {Error} Caso ocorra falha na manipulação de arquivos ou no repositório `fsGlpiRepository`.
 */

export async function validationCalledExists (dataunits: string[]) {
  const removeBR = dataunits.map(value => value?.replaceAll("<br>", ""))
  const nameUnitsExists = removeBR.filter(value => !value?.match(/\d{3}\d{3}/g))
  
  // procurar por nome e trazer a chave do objeto
  const existingUnitKey = Object.entries(standardizationUnits).filter(([key, value]) => nameUnitsExists.includes(value.name))
  const keyUnit = existingUnitKey.map(value => value[0])

  for (const keyExists of keyUnit) {
    if (fsGlpiRepository.existsFileTmp(`./tmp/${keyExists}`)) {
      await fsGlpiRepository.removeFolder(keyExists)
    }      
  }

  try {
    const existFolderUnit = fsGlpiRepository.showFolderTmp('./tmp')
    return existFolderUnit
  } catch {
    return false
  }
}

/**
 * Remove valores duplicados de um array de strings e 
 * retorna cada item formatado em HTML com quebras de linha.
 *
 * @param {string[]} arrayCalledsExists - Lista de unidades possivelmente duplicadas.
 * @returns {string[]} Lista de unidades únicas formatadas em HTML.
 */

export function uniqueUnitsToHtml (arrayCalledsExists: string[]) {
  const removeRepeatedUnits = arrayCalledsExists.filter((unit, index) => 
      arrayCalledsExists.indexOf(unit) === index)

    const mapHtmlUnits = removeRepeatedUnits.map(value => {
      if (value.length > 7) {
        return value + "<br><br>"
      }

      return value + "<br>"
    })

  return mapHtmlUnits
}

/**
 * Calcula a diferença em dias entre duas datas.
 *
 * @param {Object} params - Parâmetros da função.
 * @param {string} params.dateStart - Data inicial no formato YYYY-MM-DD.
 * @param {string} params.dateEnd - Data final no formato YYYY-MM-DD.
 * @returns {number} Número de dias de diferença entre `dateEnd` e `dateStart`.
 */

export function dayOfWeek ({ dateStart, dateEnd }: DateType) {
  const week: number = dayjs(dateEnd).diff(dayjs(dateStart), 'day')

  return week
}

/**
 * Incrementa uma data inicial em um número específico de dias.
 *
 * @param {Object} params - Parâmetros da função.
 * @param {string} params.dateStart - Data inicial no formato YYYY-MM-DD.
 * @param {number} params.day - Número de dias a adicionar à data inicial.
 * @returns {string} Data resultante no formato YYYY-MM-DD.
 */

type IncrementDayType = Omit<DateType, "dateEnd"> & { day: number }

export function incrementDay ({ day, dateStart }: IncrementDayType) {
  return dayjs(dateStart).add(day, 'day').format('YYYY-MM-DD')
}