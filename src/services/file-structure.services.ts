import { AppError } from "@/utils/AppError";
import fs from "node:fs"

function readUnits() {
  try {
    const result = fs.readdirSync("./unidade");
    return result
  } catch {
    throw new AppError("Não foi possível ler a pasta ./unidade", 500);
  }
}

function structuralTree (result: string[]) {
  let text = [`      ├── unidade`]

  // Adiciona pastas dentro da unidade
  for(const path of result) {
    const resultUnidades = checksFolders(path)

    if (path === result[result.length - 1]) {
      text.push(`      │     └── ${path}`)

      // Adiciona logs da unidade fechamento da arvore
      for (const units of resultUnidades) {
        if (units === resultUnidades[resultUnidades.length - 1]) {
          text.push(`      |            └──${units}`)
        }else {
          text.push(`      |            ├──${units}`)
        }
      }
      text.push(`      └─`)
    } else {
      text.push(`      |     |── ${path}`)

      // Adiciona logs da unidade
      for (const units of resultUnidades) {
        if (units === resultUnidades[resultUnidades.length - 1]) {
          text.push(`      |     |      └──${units}`)
        }else {
          text.push(`      |     |      ├──${units}`)
        }
      }
    }
  }

  return text.join("\n")
}

 function checksFolders (path: string) {
    try {
      return fs.readdirSync(`./unidade/${path}/Logs`);
    } catch {
      throw new AppError(`Não foi possível ler a pasta Logs de ${path}`, 500);
    }
  }

  function getFilesTree(): string {
    const units = readUnits()
    return structuralTree(units)
  }

  export { getFilesTree }