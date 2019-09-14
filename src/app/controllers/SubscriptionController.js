import { isBefore, startOfHour } from 'date-fns';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';

class SubscriptionController {

  async store (req, res) {

    const meetup = await Meetup.findByPk(req.params.meetup_id);

    // Meetup Valido?
    if (!meetup) {
      return res.status(400).json({ error: "O meetup informado não existe" })
    }

    //Não posso ser o organizador para me inscrever
    const isManager = meetup.organizador_id === req.userId;
    if (isManager) {
      return res.status(400).json({ error: "O organizador do evento não pode se inscrever no mesmo." })
    }

    // O evento já ocorreu?
    const dataHoraEvento = startOfHour(meetup.data);
    if (isBefore(dataHoraEvento, new Date())) {
      return res.status(400).json({ error: "Não permitido se inscrever em Meetups que já ocorreram." });
    }

    //não posso me inscrever duas vezes no mesmo meetup
    const mesmaSubscrition = await Subscription.findAndCountAll({
      where: {
        user_id: req.userId,
        meetup_id: meetup.id,
      }
    })

    if (mesmaSubscrition.count > 0) {
      return res.status(400).send({ error: "Usuário já inscrito neste meetup" })
    }


    //não posso me inscrever em dois meetups no mesmo horário
    const mesmoHorarioSubscriptions = await Subscription.findAndCountAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          where: {
            data: meetup.data
          }
        }
      ]
    });

    if (mesmoHorarioSubscriptions.count > 0) {
      return res.status(400).json({ error: "Você já possue inscrição neste horário" });
    }


    //inscreve o usuario
    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: meetup.id,
    });


    /**
     * fazer o envio do email
     */



    return res.json(subscription);
  }


}

export default new SubscriptionController();