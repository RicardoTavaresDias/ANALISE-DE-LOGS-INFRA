# ANALISE DE LOGS INFRA

![Project Banner](./assets/home.png) <!-- Placeholder for a banner image; replace with actual if available -->

## Descrição

A **ANÁLISE DE LOGS INFRA** é uma aplicação backend desenvolvida para simplificar e automatizar o monitoramento de logs de backup em servidores de diferentes unidades. Antes dessa solução, as equipes de TI precisavam revisar manualmente arquivos enormes – alguns com mais de 3.000 linhas por servidor – em 53 unidades diferentes. Isso significava gastar horas verificando sucessos e falhas, além de abrir chamados no sistema para registrar evidências e acompanhar os problemas. Um processo repetitivo, demorado e sujeito a erros.

Com esta aplicação, todo esse trabalho se torna automático. O usuário só precisa escolher um intervalo semanal (por exemplo, de segunda a domingo) e iniciar o processo. A partir daí, o sistema faz todo o resto: lê os logs de todos os servidores, organiza por data, horário e status (sucesso ou erro), e padroniza as informações. Em seguida, usando as credenciais do sistema de chamados, a ferramenta abre chamados para cada unidade, anexando os logs processados. Se o log apresentar apenas sucessos, o chamado já é encerrado automaticamente como concluído; se houver erros, o chamado permanece aberto para acompanhamento da equipe de TI.

A aplicação pode ser executada localmente através de um executável empacotado, funcionando de forma independente na máquina do usuário, sem depender de ambientes externos, aplicação de uso interno.

## Objetivo

O foco principal desta aplicação é eliminar o gargalo da análise manual de logs de backup, automatizando um processo que antes demandava intervenção humana intensiva em 53 unidades. Especificamente:

- **Automação de Seleção e Processamento**: Permitir que o usuário defina um intervalo semanal de datas, processe logs volumosos (milhares de linhas por servidor) de múltiplas unidades de uma só vez, e organize-os por critérios de data, horário e status – liberando equipes de tarefas tediosas.
- **Integração Inteligente com GLPI**: Após o processamento, usar credenciais fornecidas para abrir chamados por unidade, anexar evidências de logs (sucessos e erros), e gerenciar o ciclo de vida: fechamento automático para sucessos puros e manutenção aberta para erros, facilitando tratamentos rápidos pela equipe de TI.
- **Evidências para Auditoria e Conformidade**: Gerar registros semanais automatizados, comprovando a integridade dos backups e mitiga riscos de não-conformidade, com histórico auditável de todos os 53 ambientes.
- **Eficiência e Escalabilidade**: Reduzir drasticamente o tempo gasto – de horas manuais por unidade para minutos automatizados no total – permitindo foco em resoluções estratégicas, como otimização de backups ou predição de falhas via análise avançada.

Em resumo, o projeto empodera profissionais de TI a transcenderem o operacional rotineiro, fomentando uma cultura de automação que transforma desafios em oportunidades de crescimento.

## Funcionalidades Principais

- **Seleção de Intervalo Semanal**: Interface simples para o usuário definir datas (ex.: início e fim da semana), filtrando logs relevantes de servidores em 53 unidades.
- **Leitura e Padronização Automatizada**: Escaneia pastas configuráveis, processa logs extensos (>3.000 linhas por arquivo), e categoriza por data, horário, sucesso (baseado em palavras-chave como "OK" ou "Completed") e erro (ex.: "Failed" ou "Exception").
- **Organização Pós-Processamento**: Agrupa logs por unidade, criando estruturas organizadas para fácil anexação e revisão, eliminando a necessidade de análise manual inicial.
- **Integração com GLPI via Credenciais Dinâmicas**:
  - Após processamento, solicita credenciais do usuário e abre chamados automatizados para cada uma das 53 unidades.
  - Anexa logs evidenciados: sucessos para registro rápido; erros para destaque e tratamento.
  - Fluxo inteligente: Encerramento automático de chamados sem erros (status "concluído"); manutenção aberta para chamados com falhas, notificando a equipe de TI para resolução.
- **Configurações via .env**: Definição flexível de URL do GLPI, caminhos de pastas de logs, credenciais (inseridas runtime para segurança), e critérios de filtragem.
- **Execução Local e Empacotamento**: Geração de executáveis standalone via pkg, permitindo rodar offline na máquina do usuário – ideal para ambientes com 53 unidades distribuídas.
- **Extensibilidade Criativa**: Suporte a integrações futuras, como dashboards web para visualização agregada ou alertas em tempo real via e-mail/webhook para erros críticos em unidades específicas.

## Tecnologias Utilizadas

- **Backend Principal**: Node.js, com ênfase em processamento assíncrono para lidar com volumes altos de dados de múltiplas unidades.
- **Manipulação de Arquivos e Dados**: Módulos nativos como `fs` e `path`, aliados a `dotenv` para configurações seguras.
- **Integração GLPI**: API REST ou similar, com autenticação dinâmica baseada em credenciais runtime.
- **Empacotamento**: `pkg` para criação de executáveis multiplataforma, garantindo portabilidade.

## Instalação

1. **Pré-Requisitos**:
   - Node.js (versão 14+ recomendada).
   - Acesso a uma instância GLPI com API habilitada.
   - Pastas de logs acessíveis, contendo arquivos de backups das 53 unidades.

2. **Clonando o Repositório**:
   ```
   git clone https://github.com/RicardoTavaresDias/ANALISE-DE-LOGS-INFRA.git
   cd ANALISE-DE-LOGS-INFRA
   ```

3. **Instalando Dependências**:
   ```
   npm install
   ```

4. **Configuração**:

   Crie um arquivo `.env` com bases como:

    ```env
    # porta do servidor
    PORT=3333

    # caminho do servidor para documentação
    URL=http://localhost:3333

    # navegador do Puppeteer true fica a mostra ou false fica minimizado o navegador
    OFFBROWSER=true
    
    # Caminho da pasta de logs aonde será lido
    PATCHFILE=.\unidade
    ```

   - Nota: Credenciais GLPI são inseridas runtime para maior segurança; não armazene no .env.

5. **Executando a Aplicação**:

   Para desenvolvimento:

    ```
    npm run dev 
    ```

   Para produção:

    ```
    npm run build  # Gera executável
    ```

6. **Gerar executavel**:

    permite que você empacote seu projeto Node.js em um executável 

    ````
    npm install -g pkg
    ````

    Criar pasta build para produção

    ````
    npm run build
    ````

    Executa empacotamento, verifica o antivirus antes pois pode bloquear o processo.

    ````
    npm run pack
    ````


## Uso

1. **Início do Processo**: 
  
     Rode o executável ou script. Selecione o intervalo semanal de datas (ex.: 2023-09-04 a 2023-09-10).
2. **Processamento de Logs**: 

     O sistema lê e organiza logs de todas as 53 unidades automaticamente, lidando com volumes extensos sem intervenção.
3. **Integração GLPI**: 

   Forneça credenciais quando solicitado; a aplicação abre e gerencia chamados por unidade – fechando sucessos e deixando erros abertos.
4. **Exemplo de Fluxo Semanal**: 

    Para depuração, verifique logs em `./tmp` ou consulte o código em `src/`.

# Docs

Após iniciar o servidor (porta padrão: 3000), acesse a documentação Swagger em:

````
http://localhost:3333/docs
````

- Explorar os endpoints da API.
- Testar requisições diretamente pela Swagger UI.

## Contato

- **Equipe**: Infraestrutura – Ricardo Tavares Dias
- **GitHub**: [RicardoTavaresDias](https://github.com/RicardoTavaresDias)
- **Issues**: [Abrir Issue](https://github.com/RicardoTavaresDias/ANALISE-DE-LOGS-INFRA/issues)

© 2025 – Automatizando eficiência, liberando criatividade em TI.