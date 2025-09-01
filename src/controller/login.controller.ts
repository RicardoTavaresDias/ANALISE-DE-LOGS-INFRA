import { Request, Response, NextFunction } from "express";
import { loginSchema } from "@/schemas/glpi.schema";
import { GlpiCalleds } from "@/application/glpi-calleds";

/**
 * @swagger
 * /:
 *   post:
 *     summary: Login GLPI
 *     tags:
 *       - Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 example: "joao.silva"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *       400:
 *         description: Erro de validação dos dados enviados no corpo da requisição.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password is required"
 *                 issues:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["password"]
 *                       message:
 *                         type: string
 *                         example: "Password is required"
 *                       code:
 *                         type: string
 *                         example: "invalid_type"
 *       401:
 *         description: Nome de usuário ou senha inválidos
 *       500:
 *         description: Elemento de entidade não carregou após login no Glpi.
 */

export class LoginController {
  async session (request: Request, response: Response, next: NextFunction) {
    try {
      const user = loginSchema.safeParse(request.body)
      if(!user.success) {
        return response.status(400).json({ 
          message: user.error.issues.map(err => (err.path + " " + err.message)) 
        })
      }

      const glpiCalleds = new GlpiCalleds(user.data)
      await glpiCalleds.login()
      await glpiCalleds.called()
    } catch (error) {
      next(error)
    }
  }
}