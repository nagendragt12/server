const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

// let fetch;
// try {
//   fetch = require('node-fetch');
// } catch (err) {
//   // Handle error when running in a dynamic import context
//   if (err.code === 'ERR_REQUIRE_ESM') {
//     fetch = require('node-fetch').default;
//   } else {
//     throw err;
//   }
// }

const PORT = process.env.PORT || 3000;

// Database connection (replace with your credentials)
const sequelize = new Sequelize('postgres://jfvzwkju:BzUzsrjF212Xqzl7NjPs-1E9axG7OqUv@rain.db.elephantsql.com/jfvzwkju', {
  dialect: 'postgres',
});

// Models definition
const Bank = sequelize.define('Bank', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Branch = sequelize.define('Branch', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bankId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Bank,
      key: 'id',
    },
  },
});

// Relationships
Bank.hasMany(Branch, { foreignKey: 'bankId' });

// Synchronize database models
sequelize.sync()
  .then(() => console.log('Database models synchronized'))
  .catch((error) => console.error('Error synchronizing models:', error));

// Express setup
const app = express();
app.use(bodyParser.json());

// Routes

// Route to get all banks
app.get('/banks', async (req, res) => {
  try {
    const banks = await Bank.findAll({
      include: [{ model: Branch, as: 'branches' }],
    });
    res.json(banks);
  } catch (error) {
    console.error('Failed to fetch banks:', error);
    res.status(500).json({ error: 'Failed to fetch banks' });
  }
});

// Route to get a bank by ID
app.get('/banks/:id', async (req, res) => {
  try {
    const bank = await Bank.findByPk(req.params.id, {
      include: [{ model: Branch, as: 'branches' }],
    });
    if (bank) {
      res.json(bank);
    } else {
      res.status(404).json({ error: 'Bank not found' });
    }
  } catch (error) {
    console.error('Failed to fetch bank:', error);
    res.status(500).json({ error: 'Failed to fetch bank' });
  }
});

// Route to create a new bank
app.post('/banks', async (req, res) => {
  try {
    const newBank = await Bank.create(req.body);
    res.status(201).json(newBank);
  } catch (error) {
    console.error('Failed to create bank:', error);
    res.status(500).json({ error: 'Failed to create bank' });
  }
});

// Route to update a bank by ID
app.put('/banks/:id', async (req, res) => {
  try {
    const bank = await Bank.findByPk(req.params.id);
    if (bank) {
      await bank.update(req.body);
      res.json(bank);
    } else {
      res.status(404).json({ error: 'Bank not found' });
    }
  } catch (error) {
    console.error('Failed to update bank:', error);
    res.status(500).json({ error: 'Failed to update bank' });
  }
});

// Route to delete a bank by ID
app.delete('/banks/:id', async (req, res) => {
  try {
    const bank = await Bank.findByPk(req.params.id);
    if (bank) {
      await bank.destroy();
      res.status(204).end(); // No content response
    } else {
      res.status(404).json({ error: 'Bank not found' });
    }
  } catch (error) {
    console.error('Failed to delete bank:', error);
    res.status(500).json({ error: 'Failed to delete bank' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
