import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    /**
     * Esquema de validações da entrada a API
     */

    const schemaValidations = Yup.object().shape({
      name: Yup.string()
        .required()
        .max(255),
      email: Yup.string()
        .email()
        .required()
        .min(4)
        .max(255),
      password: Yup.string()
        .required()
        .min(3)
        .max(255),
    });

    // retorna msg caso nao atenda ao requisitos acima
    if (!(await schemaValidations.isValid(req.body))) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    /**
     * Todos os dados estao preenchidos de forma correta, entao,
     * os obtem da resquisicao e faz mais algumas validações
     */

    const { name, email, password } = req.body;

    // checa se email existe
    const testUSer = await User.findOne({ where: { email } });
    if (testUSer) return res.status(400).json({ error: 'Email já cadastrado' });

    // agora cadastra o usuario
    const { id } = await User.create({ name, email, password });

    return res.json({ id, name, email });
  }

  async update(req, res) {
    /**
     * Validações para alteração de usuario
     *
     * Se informou o oldPassword é porque que trocar a senha, então:
     * Obriga a informar o newPassword e o confirm para efetuar
     * a troca se for a mesma senha
     */

    const schemaValidations = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      newPassword: Yup.string().when('oldPassword', (oldPassword, field) =>
        oldPassword ? field.required() : field
      ),
      newPassword_confirm: Yup.string().when(
        'newPassword',
        (newPassword, field) =>
          newPassword ? field.required().oneOf([Yup.ref('newPassword')]) : false
      ),
    });

    if (!(await schemaValidations.isValid(req.body))) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    /**
     * Verificar se email já esta cadastrado, caso for alterado.
     * Verificar se senha antiga bate
     * verificar se nova senha e confirmação batem
     */

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExist = await User.findOne({
        where: { email },
      });

      if (userExist) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword)))
      return res.status(401).json({ error: 'Senha não confere' });

    const { id, name, provider } = await user.update(req.body);

    return res.json({ id, name, email, provider });
  }
}

export default new UserController();
