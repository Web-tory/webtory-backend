const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const dataFile = 'data.json';

// 예산 가져오기
app.get('/budget', (req, res) => {
  fs.readFile(dataFile, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data');
    } else {
      const jsonData = JSON.parse(data);
      res.json({ budget: jsonData.budget });
    }
  });
});

// 예산 업데이트
app.put('/budget', (req, res) => {
  fs.readFile(dataFile, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data');
    } else {
      const jsonData = JSON.parse(data);
      jsonData.budget = req.body.budget;  // 클라이언트로부터 받은 새 예산 값
      fs.writeFile(dataFile, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
        if (err) {
          res.status(500).send('Error writing data');
        } else {
          res.status(200).json({ budget: jsonData.budget });
        }
      });
    }
  });
});


// Get all expenses
app.get('/expenses', (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) {
      res.status(500).send('Error reading data');
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// Add a new expense
app.post('/expenses', (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) {
      res.status(500).send('Error reading data');
    } else {
      const expenses = JSON.parse(data);
      const newExpense = { id: expenses.length + 1, ...req.body, comments: [] };
      expenses.push(newExpense);
      fs.writeFile(dataFile, JSON.stringify(expenses), (err) => {
        if (err) {
          res.status(500).send('Error writing data');
        } else {
          res.status(201).json(newExpense);
        }
      });
    }
  });
});

// Add a comment to an expense
app.post('/expenses/:id/comments', (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) {
      res.status(500).send('Error reading data');
    } else {
      const expenses = JSON.parse(data);
      const expense = expenses.find(exp => exp.id === parseInt(req.params.id));
      if (expense) {
        const newComment = { id: expense.comments.length + 1, ...req.body };
        expense.comments.push(newComment);
        fs.writeFile(dataFile, JSON.stringify(expenses), (err) => {
          if (err) {
            res.status(500).send('Error writing data');
          } else {
            res.status(201).json(expense);
          }
        });
      } else {
        res.status(404).send('Expense not found');
      }
    }
  });
});

// Edit a comment
app.put('/expenses/:expenseId/comments/:commentId', (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) {
      res.status(500).send('Error reading data');
    } else {
      const expenses = JSON.parse(data);
      const expense = expenses.find(exp => exp.id === parseInt(req.params.expenseId));
      if (expense) {
        const comment = expense.comments.find(cmt => cmt.id === parseInt(req.params.commentId));
        if (comment) {
          if (comment.password === req.body.password) {
            comment.text = req.body.text;
            fs.writeFile(dataFile, JSON.stringify(expenses), (err) => {
              if (err) {
                res.status(500).send('Error writing data');
              } else {
                res.status(200).json(expense);
              }
            });
          } else {
            res.status(403).send('Incorrect password');
          }
        } else {
          res.status(404).send('Comment not found');
        }
      } else {
        res.status(404).send('Expense not found');
      }
    }
  });
});

// Delete a comment
app.delete('/expenses/:expenseId/comments/:commentId', (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) {
      res.status(500).send('Error reading data');
    } else {
      const expenses = JSON.parse(data);
      const expense = expenses.find(exp => exp.id === parseInt(req.params.expenseId));
      if (expense) {
        const commentIndex = expense.comments.findIndex(cmt => cmt.id === parseInt(req.params.commentId));
        if (commentIndex !== -1) {
          if (expense.comments[commentIndex].password === req.body.password) {
            expense.comments.splice(commentIndex, 1);
            fs.writeFile(dataFile, JSON.stringify(expenses), (err) => {
              if (err) {
                res.status(500).send('Error writing data');
              } else {
                res.status(200).json(expense);
              }
            });
          } else {
            res.status(403).send('Incorrect password');
          }
        } else {
          res.status(404).send('Comment not found');
        }
      } else {
        res.status(404).send('Expense not found');
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});