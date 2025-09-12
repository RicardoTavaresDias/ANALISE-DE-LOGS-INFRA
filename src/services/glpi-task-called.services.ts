import { FsGlpiRepository,  } from "@/repositories/fs-glpi-repository"

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