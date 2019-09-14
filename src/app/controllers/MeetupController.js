import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {

  async index (req, res) {
    const { date, page = 1 } = req.query;

    const dateSearch = date ? parseISO(date) : new Date();

    const meetups = await Meetup.findAll({
      where: {
        data: {
          [Op.between]: [startOfDay(dateSearch), endOfDay(dateSearch)]
        }
      },
      attributes: ['descricao', 'localizacao', 'data'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          as: 'organizador',
          attributes: ['name', 'email']
        },
        {
          model: File,
          as: 'banner',
          attributes: ['url', 'path']
        }
      ]
    })

    return res.json(meetups);
  }


  async store (req, res) {
    return res.json();
  }

}

export default new MeetupController();
