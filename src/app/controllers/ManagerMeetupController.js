import * as Yup from 'yup';
import { isBefore, startOfHour, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';
import File from '../models/File';

class ManagerMeetupController {
  /**
   * Lista todas os meetups cadastrados pelo organizador logado
   */

  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        organizador_id: req.userId,
      },
      attributes: ['id', 'descricao', 'localizacao', 'data'],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.json(meetups);
  }

  /**
   * Cadastra um meetup, organizador é usuario logado
   */
  async store(req, res) {
    // Valida se todos os campos foram preenchidos no formtao correto
    const schema = Yup.object().shape({
      descricao: Yup.string().required(),
      localizacao: Yup.string().required(),
      data: Yup.date().required(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Todos os campos devem ser preenchidos corretamente.' });
    }

    // pego todos os valores passados na requisição
    const { descricao, localizacao, data, banner_id } = req.body;

    // pego a data da requisição, convertendo para padrao data,
    const dataHoraEvento = startOfHour(parseISO(data));

    // verifico se a data informado é depois de agora.
    if (isBefore(dataHoraEvento, new Date())) {
      return res.status(400).json({
        error: 'A data informada não pode ser anterior a data/hora de agora.',
      });
    }

    // salva os dados no banco
    const meetup = await Meetup.create({
      descricao,
      localizacao,
      data,
      banner_id,
      organizador_id: req.userId,
    });

    return res.json(meetup);
  }

  /**
   * Organizador atualiza o meetup todos os dados do meetup
   */

  async update(req, res) {
    // Valida se todos os campos foram preenchidos no formato correto
    const schema = Yup.object().shape({
      descricao: Yup.string().required(),
      localizacao: Yup.string().required(),
      data: Yup.date().required(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Todos os campos devem ser preenchidos corretamente.' });
    }

    // busca o meetup informado
    const meetup = await Meetup.findByPk(req.params.id);

    // existo?
    if (!meetup) {
      return res.status(400).json({ error: 'O Meetup não existe.' });
    }

    // sou o Organizador?
    const souOrganizador = meetup.organizador_id === req.userId;
    if (!souOrganizador) {
      return res
        .status(400)
        .json({ error: 'Somente o organizador pode alterar seus Meetups.' });
    }

    // O evento já ocorreu?
    const dataHoraEvento = startOfHour(meetup.data);
    if (isBefore(dataHoraEvento, new Date())) {
      return res.status(400).json({
        error: 'Não permitido a alterção de Meetups que já ocorreram.',
      });
    }

    // A nova data é futura?
    const novaDataHoraEvento = startOfHour(parseISO(req.body.data));
    if (isBefore(novaDataHoraEvento, new Date())) {
      return res.status(400).json({
        error:
          'A nova data do Meetup informada não pode ser anterior a data/hora de agora.',
      });
    }

    // atualizo e pego os dados atualizados
    const { id, descricao, localizacao, data, banner_id } = Meetup.update(
      req.body
    );

    // nao vejo motivo para retornar por agora mas...
    return res.json({ id, descricao, localizacao, data, banner_id });
  }

  /**
   * Organizador deleta o meetup da base de dados
   */

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res
        .status(400)
        .json({ error: 'O Meetup não existe. Nenhum dado foi apagado.' });
    }

    const souOrganizador = meetup.organizador_id === req.userId;
    if (!souOrganizador) {
      return res
        .status(400)
        .json({ error: 'Somente o organizador pode apagar seus Meetups.' });
    }

    const dataHoraEvento = startOfHour(meetup.data);
    if (isBefore(dataHoraEvento, new Date())) {
      return res.status(400).json({
        error: 'Não permitido a exclusão de Meetups que já ocorreram.',
      });
    }

    meetup.destroy();

    return res.json();
  }
}

export default new ManagerMeetupController();
