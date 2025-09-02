import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { env } from "./env";


const options: swaggerJsDoc.Options = {
   definition: {
      openapi: "3.0.0",
      info: {
         title: "ANÁLISE DE LOGS INFRA",
         version: "1.0.0",
         description: "Projeto da equipe de Infraestrutura: Análise de logs de backup dos servidores das unidades, com abertura automática de chamados no GLPI para logs que apresentam erros.",
      },
      servers: [
         {
         url: env.URL,
         }
      ],
      paths: {}
   },
   apis: ["./src/controller/*.ts"], 
};

const swaggerSpec = swaggerJsDoc(options);

export function setupSwagger(app: Express) {
   app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
