import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        localizacao: Sequelize.STRING,
        data: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'banner_id', as: 'banner' });
    this.belongsTo(models.User, {
      foreignKey: 'organizador_id',
      as: 'organizador',
    });
  }
}

export default Meetup;
